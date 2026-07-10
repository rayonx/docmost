"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageVerificationService = exports.VerificationStatus = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const page_verification_repo_1 = require("./page-verification.repo");
const page_verification_scheduler_service_1 = require("./page-verification-scheduler.service");
const page_repo_1 = require("../../database/repos/page/page.repo");
const page_verification_dto_1 = require("./dto/page-verification.dto");
const utils_1 = require("../../database/utils");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const constants_1 = require("../../integrations/queue/constants");
const space_ability_factory_1 = require("../../core/casl/abilities/space-ability.factory");
const space_ability_type_1 = require("../../core/casl/interfaces/space-ability.type");
const audit_events_1 = require("../../common/events/audit-events");
const audit_service_1 = require("../../integrations/audit/audit.service");
const page_access_service_1 = require("../../core/page/page-access/page-access.service");
const ws_service_1 = require("../../ws/ws.service");
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["VERIFIED"] = "verified";
    VerificationStatus["EXPIRING"] = "expiring";
    VerificationStatus["EXPIRED"] = "expired";
    VerificationStatus["DRAFT"] = "draft";
    VerificationStatus["IN_APPROVAL"] = "in_approval";
    VerificationStatus["APPROVED"] = "approved";
    VerificationStatus["OBSOLETE"] = "obsolete";
    VerificationStatus["NONE"] = "none";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
let PageVerificationService = class PageVerificationService {
    constructor(verificationRepo, pageRepo, spaceAbility, pageAccessService, wsService, scheduler, db, notificationQueue, auditService) {
        this.verificationRepo = verificationRepo;
        this.pageRepo = pageRepo;
        this.spaceAbility = spaceAbility;
        this.pageAccessService = pageAccessService;
        this.wsService = wsService;
        this.scheduler = scheduler;
        this.db = db;
        this.notificationQueue = notificationQueue;
        this.auditService = auditService;
    }
    async setupVerification(dto, authUser, workspaceId) {
        const page = await this.pageRepo.findById(dto.pageId);
        if (!page || page.workspaceId !== workspaceId) {
            throw new common_1.NotFoundException('Page not found');
        }
        await this.pageAccessService.validateCanEdit(page, authUser);
        const existing = await this.verificationRepo.findByPageId(dto.pageId, workspaceId);
        if (existing) {
            throw new common_1.BadRequestException('Verification is already set up for this page');
        }
        const uniqueVerifierIds = [...new Set(dto.verifierIds)];
        if (uniqueVerifierIds.length < 1) {
            throw new common_1.BadRequestException('At least one verifier is required');
        }
        if (uniqueVerifierIds.length > 5) {
            throw new common_1.BadRequestException('Maximum of 5 verifiers allowed');
        }
        await this.validateWorkspaceMembers(uniqueVerifierIds, page.workspaceId);
        const verificationType = dto.type ?? page_verification_dto_1.VerificationType.EXPIRING;
        const isQms = verificationType === page_verification_dto_1.VerificationType.QMS;
        if (!isQms && !dto.mode) {
            throw new common_1.BadRequestException('Expiration mode is required for expiring verification');
        }
        if (!isQms) {
            this.validateExpirationInput(dto.mode, dto.periodAmount, dto.periodUnit, dto.fixedExpiresAt);
        }
        const now = new Date();
        const result = await (0, utils_1.executeTx)(this.db, async (trx) => {
            const verification = await this.verificationRepo.insertVerification({
                pageId: dto.pageId,
                workspaceId: page.workspaceId,
                spaceId: page.spaceId,
                type: verificationType,
                status: isQms ? page_verification_dto_1.QmsStatus.DRAFT : null,
                mode: isQms ? null : dto.mode,
                periodAmount: isQms || dto.mode !== page_verification_dto_1.ExpirationMode.PERIOD
                    ? null
                    : dto.periodAmount,
                periodUnit: isQms || dto.mode !== page_verification_dto_1.ExpirationMode.PERIOD
                    ? null
                    : dto.periodUnit,
                verifiedAt: isQms ? null : now,
                verifiedById: isQms ? null : authUser.id,
                expiresAt: isQms
                    ? null
                    : this.computeExpiresAt(dto.mode, dto.periodAmount, dto.periodUnit, dto.fixedExpiresAt, now),
                creatorId: authUser.id,
            }, trx);
            const verifiers = uniqueVerifierIds.map((userId) => ({
                pageVerificationId: verification.id,
                userId,
                addedById: authUser.id,
            }));
            await this.verificationRepo.insertVerifiers(verifiers, trx);
            return verification;
        });
        this.auditService.log({
            event: audit_events_1.AuditEvent.PAGE_VERIFICATION_CREATED,
            resourceType: audit_events_1.AuditResource.PAGE,
            resourceId: dto.pageId,
            spaceId: page.spaceId,
            metadata: {
                pageTitle: page.title,
                type: verificationType,
                mode: dto.mode ?? null,
                periodAmount: dto.periodAmount ?? null,
                periodUnit: dto.periodUnit ?? null,
                verifierCount: uniqueVerifierIds.length,
            },
        });
        this.emitVerificationUpdate(page.spaceId, dto.pageId);
        await this.scheduler.reschedule(result.id, result.expiresAt ?? null);
        return result;
    }
    async verifyPage(pageId, authUser, workspaceId) {
        const page = await this.pageRepo.findById(pageId);
        if (!page || page.workspaceId !== workspaceId) {
            throw new common_1.NotFoundException('Page not found');
        }
        const verification = await this.verificationRepo.findByPageId(pageId, workspaceId);
        if (!verification) {
            throw new common_1.NotFoundException('Verification not set up for this page');
        }
        const isDesignatedVerifier = verification.verifiers.some((verifier) => verifier.userId === authUser.id);
        if (isDesignatedVerifier) {
            await this.pageAccessService.validateCanView(page, authUser);
        }
        else {
            await this.pageAccessService.validateCanEdit(page, authUser);
            const ability = await this.spaceAbility.createForUser(authUser, page.spaceId);
            if (ability.cannot(space_ability_type_1.SpaceCaslAction.Manage, space_ability_type_1.SpaceCaslSubject.Settings)) {
                throw new common_1.ForbiddenException();
            }
        }
        const now = new Date();
        const isQms = verification.type === page_verification_dto_1.VerificationType.QMS;
        if (!isQms &&
            verification.mode === page_verification_dto_1.ExpirationMode.FIXED &&
            verification.expiresAt &&
            new Date(verification.expiresAt).getTime() <= now.getTime()) {
            throw new common_1.BadRequestException('Fixed expiration date is in the past. Update the expiration date before verifying.');
        }
        const nextExpiresAt = isQms
            ? null
            : verification.mode === page_verification_dto_1.ExpirationMode.FIXED
                ? verification.expiresAt
                : this.computeExpiresAt(verification.mode, verification.periodAmount ?? undefined, verification.periodUnit ?? undefined, undefined, now);
        await this.verificationRepo.updateVerification(verification.id, {
            verifiedAt: now,
            verifiedById: authUser.id,
            expiresAt: nextExpiresAt,
            updatedAt: now,
            ...(isQms && {
                status: page_verification_dto_1.QmsStatus.APPROVED,
                rejectedAt: null,
                rejectedById: null,
                rejectionComment: null,
            }),
        });
        const verifierIds = verification.verifiers
            .map((verifier) => verifier.userId)
            .filter((id) => id !== authUser.id);
        if (verifierIds.length > 0) {
            await this.notificationQueue.add(constants_1.QueueJob.PAGE_VERIFIED_NOTIFICATION, {
                pageId: page.id,
                spaceId: page.spaceId,
                workspaceId: page.workspaceId,
                actorId: authUser.id,
                verifierIds,
            });
        }
        this.auditService.log({
            event: audit_events_1.AuditEvent.PAGE_VERIFIED,
            resourceType: audit_events_1.AuditResource.PAGE,
            resourceId: pageId,
            spaceId: page.spaceId,
            metadata: { pageTitle: page.title },
        });
        this.emitVerificationUpdate(page.spaceId, pageId);
        await this.scheduler.reschedule(verification.id, nextExpiresAt);
    }
    async submitForApproval(pageId, authUser, workspaceId) {
        const page = await this.pageRepo.findById(pageId);
        if (!page || page.workspaceId !== workspaceId) {
            throw new common_1.NotFoundException('Page not found');
        }
        await this.pageAccessService.validateCanEdit(page, authUser);
        const verification = await this.verificationRepo.findByPageId(pageId, workspaceId);
        if (!verification) {
            throw new common_1.NotFoundException('Verification not set up for this page');
        }
        if (verification.type !== page_verification_dto_1.VerificationType.QMS) {
            throw new common_1.BadRequestException('Only QMS verifications support approval');
        }
        if (verification.status !== page_verification_dto_1.QmsStatus.DRAFT &&
            verification.status !== page_verification_dto_1.QmsStatus.APPROVED) {
            throw new common_1.BadRequestException('Page must be in draft or approved status to submit for approval');
        }
        const now = new Date();
        await this.verificationRepo.updateVerification(verification.id, {
            status: page_verification_dto_1.QmsStatus.IN_APPROVAL,
            requestedAt: now,
            requestedById: authUser.id,
            updatedAt: now,
        });
        const verifierIds = verification.verifiers
            .map((verifier) => verifier.userId)
            .filter((id) => id !== authUser.id);
        if (verifierIds.length > 0) {
            await this.notificationQueue.add(constants_1.QueueJob.PAGE_APPROVAL_REQUESTED_NOTIFICATION, {
                pageId: page.id,
                spaceId: page.spaceId,
                workspaceId: page.workspaceId,
                actorId: authUser.id,
                verifierIds,
            });
        }
        this.auditService.log({
            event: audit_events_1.AuditEvent.PAGE_APPROVAL_REQUESTED,
            resourceType: audit_events_1.AuditResource.PAGE,
            resourceId: pageId,
            spaceId: page.spaceId,
            metadata: { pageTitle: page.title },
        });
        this.emitVerificationUpdate(page.spaceId, pageId);
    }
    async rejectApproval(pageId, comment, authUser, workspaceId) {
        const page = await this.pageRepo.findById(pageId);
        if (!page || page.workspaceId !== workspaceId) {
            throw new common_1.NotFoundException('Page not found');
        }
        const verification = await this.verificationRepo.findByPageId(pageId, workspaceId);
        if (!verification) {
            throw new common_1.NotFoundException('Verification not set up for this page');
        }
        const isDesignatedVerifier = verification.verifiers.some((verifier) => verifier.userId === authUser.id);
        if (isDesignatedVerifier) {
            await this.pageAccessService.validateCanView(page, authUser);
        }
        else {
            await this.pageAccessService.validateCanEdit(page, authUser);
            const ability = await this.spaceAbility.createForUser(authUser, page.spaceId);
            if (ability.cannot(space_ability_type_1.SpaceCaslAction.Manage, space_ability_type_1.SpaceCaslSubject.Settings)) {
                throw new common_1.ForbiddenException();
            }
        }
        if (verification.type !== page_verification_dto_1.VerificationType.QMS) {
            throw new common_1.BadRequestException('Only QMS verifications support rejection');
        }
        if (verification.status !== page_verification_dto_1.QmsStatus.IN_APPROVAL) {
            throw new common_1.BadRequestException('Page must be in approval status to reject');
        }
        const now = new Date();
        await this.verificationRepo.updateVerification(verification.id, {
            status: page_verification_dto_1.QmsStatus.DRAFT,
            rejectedAt: now,
            rejectedById: authUser.id,
            rejectionComment: comment ?? null,
            updatedAt: now,
        });
        if (verification.requestedById) {
            await this.notificationQueue.add(constants_1.QueueJob.PAGE_APPROVAL_REJECTED_NOTIFICATION, {
                pageId: page.id,
                spaceId: page.spaceId,
                workspaceId: page.workspaceId,
                actorId: authUser.id,
                requestedById: verification.requestedById,
                comment: comment ?? null,
            });
        }
        this.auditService.log({
            event: audit_events_1.AuditEvent.PAGE_APPROVAL_REJECTED,
            resourceType: audit_events_1.AuditResource.PAGE,
            resourceId: pageId,
            spaceId: page.spaceId,
            metadata: { pageTitle: page.title },
        });
        this.emitVerificationUpdate(page.spaceId, pageId);
    }
    async markObsolete(pageId, authUser, workspaceId) {
        const page = await this.pageRepo.findById(pageId);
        if (!page || page.workspaceId !== workspaceId) {
            throw new common_1.NotFoundException('Page not found');
        }
        await this.pageAccessService.validateCanEdit(page, authUser);
        const verification = await this.verificationRepo.findByPageId(pageId, workspaceId);
        if (!verification) {
            throw new common_1.NotFoundException('Verification not set up for this page');
        }
        if (verification.type !== page_verification_dto_1.VerificationType.QMS) {
            throw new common_1.BadRequestException('Only QMS verifications support obsolete status');
        }
        if (verification.status !== page_verification_dto_1.QmsStatus.APPROVED) {
            throw new common_1.BadRequestException('Page must be approved to mark as obsolete');
        }
        await this.verificationRepo.updateVerification(verification.id, {
            status: page_verification_dto_1.QmsStatus.OBSOLETE,
            updatedAt: new Date(),
        });
        this.auditService.log({
            event: audit_events_1.AuditEvent.PAGE_MARKED_OBSOLETE,
            resourceType: audit_events_1.AuditResource.PAGE,
            resourceId: pageId,
            spaceId: page.spaceId,
            metadata: { pageTitle: page.title },
        });
        this.emitVerificationUpdate(page.spaceId, pageId);
    }
    async updateVerification(dto, authUser, workspaceId) {
        const page = await this.pageRepo.findById(dto.pageId);
        if (!page || page.workspaceId !== workspaceId) {
            throw new common_1.NotFoundException('Page not found');
        }
        await this.pageAccessService.validateCanEdit(page, authUser);
        const verification = await this.verificationRepo.findByPageId(dto.pageId, workspaceId);
        if (!verification) {
            throw new common_1.NotFoundException('Verification not set up for this page');
        }
        if (verification.type === page_verification_dto_1.VerificationType.QMS &&
            verification.status === page_verification_dto_1.QmsStatus.OBSOLETE) {
            throw new common_1.BadRequestException('Cannot update verification for an obsolete page');
        }
        let uniqueVerifierIds;
        if (dto.verifierIds !== undefined) {
            uniqueVerifierIds = [...new Set(dto.verifierIds)];
            if (uniqueVerifierIds.length < 1) {
                throw new common_1.BadRequestException('At least one verifier is required');
            }
            if (uniqueVerifierIds.length > 5) {
                throw new common_1.BadRequestException('Maximum of 5 verifiers allowed');
            }
            await this.validateWorkspaceMembers(uniqueVerifierIds, page.workspaceId);
        }
        const updateData = {
            updatedAt: new Date(),
        };
        const modeChanged = dto.mode !== undefined && dto.mode !== verification.mode;
        const periodAmountChanged = dto.periodAmount !== undefined &&
            dto.periodAmount !== verification.periodAmount;
        const periodUnitChanged = dto.periodUnit !== undefined &&
            dto.periodUnit !== verification.periodUnit;
        const fixedDateChanged = dto.fixedExpiresAt !== undefined &&
            (!verification.expiresAt ||
                new Date(dto.fixedExpiresAt).getTime() !==
                    new Date(verification.expiresAt).getTime());
        if (modeChanged ||
            periodAmountChanged ||
            periodUnitChanged ||
            fixedDateChanged) {
            const nextMode = (dto.mode ?? verification.mode);
            const nextPeriodAmount = dto.periodAmount ?? verification.periodAmount ?? undefined;
            const nextPeriodUnit = (dto.periodUnit ??
                verification.periodUnit ??
                undefined);
            this.validateExpirationInput(nextMode, nextPeriodAmount, nextPeriodUnit, dto.fixedExpiresAt);
            updateData.mode = nextMode;
            updateData.periodAmount =
                nextMode === page_verification_dto_1.ExpirationMode.PERIOD ? nextPeriodAmount : null;
            updateData.periodUnit =
                nextMode === page_verification_dto_1.ExpirationMode.PERIOD ? nextPeriodUnit : null;
            updateData.expiresAt = this.computeExpiresAt(nextMode, nextPeriodAmount, nextPeriodUnit, dto.fixedExpiresAt, verification.verifiedAt ? new Date(verification.verifiedAt) : undefined);
        }
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            await this.verificationRepo.updateVerification(verification.id, updateData, trx);
            if (uniqueVerifierIds) {
                await this.verificationRepo.deleteVerifiersByVerificationId(verification.id, trx);
                const verifiers = uniqueVerifierIds.map((userId) => ({
                    pageVerificationId: verification.id,
                    userId,
                    addedById: authUser.id,
                }));
                await this.verificationRepo.insertVerifiers(verifiers, trx);
            }
        });
        this.auditService.log({
            event: audit_events_1.AuditEvent.PAGE_VERIFICATION_UPDATED,
            resourceType: audit_events_1.AuditResource.PAGE,
            resourceId: dto.pageId,
            spaceId: page.spaceId,
            metadata: { pageTitle: page.title },
        });
        this.emitVerificationUpdate(page.spaceId, dto.pageId);
        const nextExpiresAt = updateData.expiresAt !== undefined
            ? updateData.expiresAt
            : (verification.expiresAt ?? null);
        await this.scheduler.reschedule(verification.id, nextExpiresAt);
    }
    async removeVerification(pageId, authUser, workspaceId) {
        const page = await this.pageRepo.findById(pageId);
        if (!page || page.workspaceId !== workspaceId) {
            throw new common_1.NotFoundException('Page not found');
        }
        await this.pageAccessService.validateCanEdit(page, authUser);
        const verification = await this.verificationRepo.findByPageId(pageId, workspaceId);
        if (!verification) {
            throw new common_1.NotFoundException('Verification not set up for this page');
        }
        await this.verificationRepo.deleteByPageId(pageId);
        this.auditService.log({
            event: audit_events_1.AuditEvent.PAGE_VERIFICATION_REMOVED,
            resourceType: audit_events_1.AuditResource.PAGE,
            resourceId: pageId,
            spaceId: page.spaceId,
            metadata: { pageTitle: page.title },
        });
        this.emitVerificationUpdate(page.spaceId, pageId);
        await this.scheduler.reschedule(verification.id, null);
    }
    async getVerificationInfo(pageId, authUser, workspaceId) {
        const page = await this.pageRepo.findById(pageId);
        if (!page || page.workspaceId !== workspaceId) {
            throw new common_1.NotFoundException('Page not found');
        }
        const { canEdit } = await this.pageAccessService.validateCanViewWithPermissions(page, authUser);
        const ability = await this.spaceAbility.createForUser(authUser, page.spaceId);
        const verification = await this.verificationRepo.findByPageId(pageId, workspaceId);
        if (!verification) {
            return { status: VerificationStatus.NONE };
        }
        const isQms = verification.type === page_verification_dto_1.VerificationType.QMS;
        const status = isQms
            ? (verification.status ?? VerificationStatus.NONE)
            : this.computeExpiringStatus(verification.expiresAt);
        const isSpaceAdmin = ability.can(space_ability_type_1.SpaceCaslAction.Manage, space_ability_type_1.SpaceCaslSubject.Settings);
        const isVerifier = verification.verifiers.some((verifier) => verifier.userId === authUser.id);
        const verifiedBy = await this.resolveUserRef(verification.verifiedById, verification.verifiers);
        const requestedBy = isQms
            ? await this.resolveUserRef(verification.requestedById, verification.verifiers)
            : null;
        const rejectedBy = isQms
            ? await this.resolveUserRef(verification.rejectedById, verification.verifiers)
            : null;
        return {
            id: verification.id,
            pageId: verification.pageId,
            type: verification.type,
            mode: verification.mode,
            periodAmount: verification.periodAmount,
            periodUnit: verification.periodUnit,
            status,
            verifiedAt: verification.verifiedAt,
            verifiedBy,
            expiresAt: verification.expiresAt,
            requestedAt: isQms ? verification.requestedAt : undefined,
            requestedBy,
            rejectedAt: isQms ? verification.rejectedAt : undefined,
            rejectedBy,
            rejectionComment: isQms ? verification.rejectionComment : undefined,
            verifiers: verification.verifiers.map((verifier) => ({
                id: verifier.userId,
                name: verifier.name,
                avatarUrl: verifier.avatarUrl,
                email: verifier.email,
            })),
            permissions: {
                canVerify: canEdit && (isVerifier || isSpaceAdmin),
                canManage: canEdit,
                canSubmitForApproval: isQms &&
                    canEdit &&
                    (status === VerificationStatus.DRAFT ||
                        status === VerificationStatus.APPROVED),
                canMarkObsolete: isQms && canEdit && status === VerificationStatus.APPROVED,
            },
        };
    }
    async listVerifications(dto, pagination, authUser, workspaceId) {
        const result = await this.verificationRepo.findByWorkspace(authUser.id, workspaceId, {
            spaceIds: dto.spaceIds,
            verifierId: dto.verifierId,
            type: dto.type,
        }, pagination);
        return {
            ...result,
            items: result.items.map((item) => ({
                ...item,
                status: item.type === page_verification_dto_1.VerificationType.QMS
                    ? item.status
                    : this.computeExpiringStatus(item.expiresAt),
                verifiers: item.verifiers.map((verifier) => ({
                    id: verifier.userId,
                    name: verifier.name,
                    avatarUrl: verifier.avatarUrl,
                })),
            })),
        };
    }
    computeExpiresAt(mode, periodAmount, periodUnit, fixedExpiresAt, from) {
        if (mode === page_verification_dto_1.ExpirationMode.INDEFINITE) {
            return null;
        }
        if (mode === page_verification_dto_1.ExpirationMode.FIXED) {
            return fixedExpiresAt ? new Date(fixedExpiresAt) : null;
        }
        if (mode === page_verification_dto_1.ExpirationMode.PERIOD) {
            if (!periodAmount || !periodUnit)
                return null;
            const base = from ?? new Date();
            const expiresAt = new Date(base);
            const days = periodAmount * page_verification_dto_1.PERIOD_UNIT_DAYS[periodUnit];
            expiresAt.setDate(expiresAt.getDate() + days);
            return expiresAt;
        }
        return null;
    }
    validateExpirationInput(mode, periodAmount, periodUnit, fixedExpiresAt) {
        if (mode === page_verification_dto_1.ExpirationMode.PERIOD) {
            if (!periodAmount || !periodUnit) {
                throw new common_1.BadRequestException('Period amount and unit are required for period mode');
            }
            if (!Number.isInteger(periodAmount) || periodAmount < page_verification_dto_1.PERIOD_AMOUNT_MIN) {
                throw new common_1.BadRequestException(`Period amount must be at least ${page_verification_dto_1.PERIOD_AMOUNT_MIN}`);
            }
            const unitMax = page_verification_dto_1.PERIOD_UNIT_MAX_AMOUNT[periodUnit];
            if (periodAmount > unitMax) {
                throw new common_1.BadRequestException(`Period amount must be at most ${unitMax} for ${periodUnit}`);
            }
        }
        if (mode === page_verification_dto_1.ExpirationMode.FIXED) {
            if (!fixedExpiresAt) {
                throw new common_1.BadRequestException('A fixed expiration date is required for fixed mode');
            }
            const date = new Date(fixedExpiresAt);
            if (Number.isNaN(date.getTime())) {
                throw new common_1.BadRequestException('Invalid fixed expiration date');
            }
            if (date.getTime() <= Date.now()) {
                throw new common_1.BadRequestException('Fixed expiration date must be in the future');
            }
        }
    }
    computeExpiringStatus(expiresAt) {
        if (!expiresAt)
            return VerificationStatus.VERIFIED;
        const now = new Date();
        const expires = new Date(expiresAt);
        if (expires <= now)
            return VerificationStatus.EXPIRED;
        const fourDaysMs = 4 * 24 * 60 * 60 * 1000;
        if (expires.getTime() - now.getTime() <= fourDaysMs) {
            return VerificationStatus.EXPIRING;
        }
        return VerificationStatus.VERIFIED;
    }
    async resolveUserRef(userId, verifiers) {
        if (!userId)
            return null;
        const fromVerifiers = verifiers.find((verifier) => verifier.userId === userId);
        if (fromVerifiers) {
            return {
                id: userId,
                name: fromVerifiers.name,
                avatarUrl: fromVerifiers.avatarUrl,
            };
        }
        const user = await this.db
            .selectFrom('users')
            .select(['id', 'name', 'avatarUrl'])
            .where('id', '=', userId)
            .executeTakeFirst();
        return user
            ? { id: user.id, name: user.name, avatarUrl: user.avatarUrl }
            : null;
    }
    emitVerificationUpdate(spaceId, pageId) {
        this.wsService
            .emitCommentEvent(spaceId, pageId, {
            operation: 'verificationUpdated',
            pageId,
        })
            .catch(() => { });
    }
    async validateWorkspaceMembers(userIds, workspaceId) {
        const users = await this.db
            .selectFrom('users')
            .select('id')
            .where('id', 'in', userIds)
            .where('workspaceId', '=', workspaceId)
            .where('deactivatedAt', 'is', null)
            .where('deletedAt', 'is', null)
            .execute();
        if (users.length !== userIds.length) {
            throw new common_1.BadRequestException('One or more verifier IDs are not valid workspace members');
        }
    }
};
exports.PageVerificationService = PageVerificationService;
exports.PageVerificationService = PageVerificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(6, (0, nestjs_kysely_1.InjectKysely)()),
    __param(7, (0, bullmq_1.InjectQueue)(constants_1.QueueName.NOTIFICATION_QUEUE)),
    __param(8, (0, common_1.Inject)(audit_service_1.AUDIT_SERVICE)),
    __metadata("design:paramtypes", [page_verification_repo_1.PageVerificationRepo,
        page_repo_1.PageRepo,
        space_ability_factory_1.default,
        page_access_service_1.PageAccessService,
        ws_service_1.WsService,
        page_verification_scheduler_service_1.PageVerificationSchedulerService, Object, bullmq_2.Queue, Object])
], PageVerificationService);
//# sourceMappingURL=page-verification.service.js.map