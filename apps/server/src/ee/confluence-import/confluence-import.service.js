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
var ConfluenceImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfluenceImportService = void 0;
const common_1 = require("@nestjs/common");
const path = require("path");
const collaboration_util_1 = require("../../collaboration/collaboration.util");
const nestjs_kysely_1 = require("nestjs-kysely");
const import_service_1 = require("../../integrations/import/services/import.service");
const fs_1 = require("fs");
const helpers_1 = require("../../common/helpers");
const editor_ext_1 = require("@docmost/editor-ext");
const uuid_1 = require("uuid");
const slugify_1 = require("@sindresorhus/slugify");
const fractional_indexing_jittered_1 = require("fractional-indexing-jittered");
const import_formatter_1 = require("../../integrations/import/utils/import-formatter");
const import_utils_1 = require("../../integrations/import/utils/import.utils");
const utils_1 = require("../../database/utils");
const cheerio_1 = require("cheerio");
const backlink_repo_1 = require("../../database/repos/backlink/backlink.repo");
const import_attachment_service_1 = require("../../integrations/import/services/import-attachment.service");
const environment_service_1 = require("../../integrations/environment/environment.service");
const license_check_service_1 = require("../../integrations/environment/license-check.service");
const feature_registry_1 = require("../licence/feature-registry");
const page_service_1 = require("../../core/page/services/page.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const event_contants_1 = require("../../common/events/event.contants");
const audit_events_1 = require("../../common/events/audit-events");
const audit_service_1 = require("../../integrations/audit/audit.service");
const confluence_import_utils_1 = require("./confluence-import.utils");
let ConfluenceImportService = ConfluenceImportService_1 = class ConfluenceImportService {
    constructor(importService, backlinkRepo, importAttachmentService, pageService, environmentService, licenseCheckService, db, eventEmitter, auditService) {
        this.importService = importService;
        this.backlinkRepo = backlinkRepo;
        this.importAttachmentService = importAttachmentService;
        this.pageService = pageService;
        this.environmentService = environmentService;
        this.licenseCheckService = licenseCheckService;
        this.db = db;
        this.eventEmitter = eventEmitter;
        this.auditService = auditService;
        this.logger = new common_1.Logger(ConfluenceImportService_1.name);
    }
    async processConfluenceImport(opts) {
        const { extractDir: mainExtractDir, fileTask } = opts;
        const workspace = await this.db
            .selectFrom('workspaces')
            .select(['id', 'licenseKey'])
            .where('id', '=', fileTask.workspaceId)
            .executeTakeFirst();
        if (!this.environmentService.isCloud()) {
            if (!this.licenseCheckService.hasFeature(workspace.licenseKey, feature_registry_1.Feature.CONFLUENCE_IMPORT)) {
                throw new common_1.ForbiddenException('This feature requires a valid license.');
            }
        }
        const space = await this.db
            .selectFrom('spaces')
            .select(['slug'])
            .where('id', '=', fileTask.spaceId)
            .executeTakeFirst();
        if (!space) {
            throw new Error('Space not found');
        }
        const spaceSlug = space.slug;
        const dirents = await fs_1.promises.readdir(mainExtractDir, { withFileTypes: true });
        const spaceDir = dirents
            .filter((d) => d.isDirectory())
            .map((d) => d.name)
            .find((name) => fs_1.promises
            .access(path.join(mainExtractDir, name, 'index.html'))
            .then(() => true)
            .catch(() => false));
        if (!spaceDir) {
            return;
        }
        const extractDir = path.join(mainExtractDir, spaceDir);
        const attachmentCandidates = await (0, import_utils_1.buildAttachmentCandidates)(extractDir);
        const confluenceTree = await this.parseConfluenceIndex(extractDir);
        const entries = [];
        const flattenTree = (nodes, parent) => {
            for (const n of nodes) {
                entries.push({ href: n.href, title: n.title, parentHref: parent });
                if (n.children.length)
                    flattenTree(n.children, n.href);
            }
        };
        flattenTree(confluenceTree, null);
        const pagesMap = new Map();
        for (const e of entries) {
            pagesMap.set(e.href, {
                id: (0, uuid_1.v7)(),
                slugId: (0, helpers_1.generateSlugId)(),
                name: e.title,
                content: '',
                parentHref: e.parentHref,
            });
        }
        pagesMap.forEach((p) => {
            p.parentPageId = p.parentHref ? pagesMap.get(p.parentHref).id : null;
        });
        const siblings = new Map();
        pagesMap.forEach((p) => {
            const key = p.parentPageId;
            (siblings.get(key) ?? siblings.set(key, []).get(key)).push(p);
        });
        const rootGroup = siblings.get(null);
        if (rootGroup?.length) {
            const nextPosition = await this.pageService.nextPagePosition(fileTask.spaceId);
            let prev = null;
            rootGroup.forEach((p, idx) => {
                p.position =
                    idx === 0 ? nextPosition : (0, fractional_indexing_jittered_1.generateJitteredKeyBetween)(prev, null);
                prev = p.position;
            });
        }
        siblings.forEach((group, parentId) => {
            if (parentId === null)
                return;
            let prev = null;
            for (const p of group) {
                p.position = (0, fractional_indexing_jittered_1.generateJitteredKeyBetween)(prev, null);
                prev = p.position;
            }
        });
        const filePathToMeta = new Map();
        pagesMap.forEach((p, href) => {
            filePathToMeta.set(href, {
                id: p.id,
                title: p.name,
                slugId: p.slugId,
            });
        });
        const pagesByLevel = new Map();
        const pageLevel = new Map();
        const calculateLevels = () => {
            const queue = [];
            for (const [href, page] of pagesMap.entries()) {
                if (!page.parentHref) {
                    queue.push({ href, level: 0 });
                    pageLevel.set(href, 0);
                }
            }
            while (queue.length > 0) {
                const { href, level } = queue.shift();
                for (const [childHref, childPage] of pagesMap.entries()) {
                    if (childPage.parentHref === href && !pageLevel.has(childHref)) {
                        pageLevel.set(childHref, level + 1);
                        queue.push({ href: childHref, level: level + 1 });
                    }
                }
            }
            for (const [href, page] of pagesMap.entries()) {
                const level = pageLevel.get(href) || 0;
                if (!pagesByLevel.has(level)) {
                    pagesByLevel.set(level, []);
                }
                pagesByLevel.get(level).push([href, page]);
            }
        };
        calculateLevels();
        const pageHrefs = Array.from(pagesMap.keys());
        const anchorMap = await this.collectConfluenceAnchors(extractDir, pageHrefs);
        this.logger.debug(`Found ${anchorMap.size} Confluence anchors`);
        const allBacklinks = [];
        const validPageIds = new Set();
        const pageTitles = new Map();
        let totalPagesProcessed = 0;
        const sortedLevels = Array.from(pagesByLevel.keys()).sort((a, b) => a - b);
        this.logger.debug(`Total pages found: ${pagesMap.size}`);
        this.logger.debug(`Total file attachments found: ${attachmentCandidates.size}`);
        try {
            await (0, utils_1.executeTx)(this.db, async (trx) => {
                for (const level of sortedLevels) {
                    const levelPages = pagesByLevel.get(level);
                    for (const [href, page] of levelPages) {
                        this.logger.debug(`Processing page: ${href}`);
                        const abs = this.resolveWithinExtractDir(extractDir, href);
                        const rawHtml = (0, confluence_import_utils_1.fixSelfClosingTags)(await fs_1.promises.readFile(abs, 'utf-8'));
                        const { attachments, cleanedHtml } = this.extractAttachmentsMacroAndCleanHtml(rawHtml);
                        const { html, backlinks } = await this.formatImportHtml({
                            html: cleanedHtml,
                            currentFilePath: href,
                            filePathToPageMetaMap: filePathToMeta,
                            creatorId: fileTask.creatorId,
                            sourcePageId: page.id,
                            workspaceId: fileTask.workspaceId,
                            anchorMap,
                            spaceSlug,
                        });
                        const htmlContent = await this.importAttachmentService.processAttachments({
                            html: html,
                            pageRelativePath: href,
                            extractDir,
                            pageId: page.id,
                            fileTask,
                            attachmentCandidates,
                            pageAttachments: attachments,
                            isConfluenceImport: true,
                        });
                        const prosemirrorJson = await this.importService.processHTML(htmlContent);
                        const insertablePage = {
                            id: page.id,
                            slugId: page.slugId,
                            title: page.name,
                            content: prosemirrorJson,
                            textContent: (0, collaboration_util_1.jsonToText)(prosemirrorJson),
                            ydoc: await this.importService.createYdoc(prosemirrorJson),
                            position: page.position,
                            spaceId: fileTask.spaceId,
                            workspaceId: fileTask.workspaceId,
                            creatorId: fileTask.creatorId,
                            lastUpdatedById: fileTask.creatorId,
                            parentPageId: page.parentPageId,
                        };
                        await trx.insertInto('pages').values(insertablePage).execute();
                        validPageIds.add(insertablePage.id);
                        pageTitles.set(insertablePage.id, insertablePage.title);
                        allBacklinks.push(...backlinks);
                        totalPagesProcessed++;
                        if (totalPagesProcessed % 10 === 0) {
                            this.logger.debug(`Processed ${totalPagesProcessed} pages...`);
                        }
                    }
                }
                const filteredBacklinks = allBacklinks.filter(({ sourcePageId, targetPageId }) => validPageIds.has(sourcePageId) && validPageIds.has(targetPageId));
                if (filteredBacklinks.length > 0) {
                    const BACKLINK_BATCH_SIZE = 100;
                    for (let i = 0; i < filteredBacklinks.length; i += BACKLINK_BATCH_SIZE) {
                        const backlinkChunk = filteredBacklinks.slice(i, Math.min(i + BACKLINK_BATCH_SIZE, filteredBacklinks.length));
                        await this.backlinkRepo.insertBacklink(backlinkChunk, trx);
                    }
                }
                this.logger.log(`Successfully imported ${totalPagesProcessed} pages with ${filteredBacklinks.length} backlinks`);
            });
            if (validPageIds.size > 0) {
                this.eventEmitter.emit(event_contants_1.EventName.PAGE_CREATED, {
                    pageIds: Array.from(validPageIds),
                    workspaceId: fileTask.workspaceId,
                });
                const auditPayloads = Array.from(validPageIds).map((pageId) => ({
                    event: audit_events_1.AuditEvent.PAGE_CREATED,
                    resourceType: audit_events_1.AuditResource.PAGE,
                    resourceId: pageId,
                    spaceId: fileTask.spaceId,
                    metadata: {
                        source: 'confluence',
                        fileTaskId: fileTask.id,
                        title: pageTitles.get(pageId),
                    },
                }));
                this.auditService.logBatchWithContext(auditPayloads, {
                    workspaceId: fileTask.workspaceId,
                    actorId: fileTask.creatorId,
                    actorType: 'user',
                });
            }
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to import Confluence space');
            throw new Error(`Confluence import failed: ${error?.['message']}`);
        }
    }
    confluenceFormatter($, $root, currentFilePath, anchorMap, filePathToPageMetaMap, spaceSlug) {
        if (currentFilePath && anchorMap && filePathToPageMetaMap && spaceSlug) {
            this.processConfluenceAnchors($, $root, currentFilePath, anchorMap, filePathToPageMetaMap, spaceSlug);
        }
        const simpleSelectors = [
            '#main-header',
            '#breadcrumb-section',
            '#title-heading',
            'div.page-metadata',
            '#footer',
            'div.toc-macro',
            'div[class*="toc-macro"]',
            '.plugin_attachments_container',
            'div.more-link-container',
            'div.ap-container[id*="drawio"]',
            'img.icon',
            'div.recently-updated',
            'div[class*="recently-updated"]',
            'div.content-by-label',
            'div[class*="content-by-label"]',
        ];
        $root.find(simpleSelectors.join(', ')).each((_, el) => {
            const $el = $(el);
            $el.remove();
        });
        $root.find('div.columnLayout').each((_, el) => {
            const $layout = $(el);
            const sectionType = $layout.attr('data-layout') || 'two_equal';
            const $cells = $layout.find('> div.cell');
            if ($cells.length <= 1) {
                const innerHtml = $cells.find('> div.innerCell').html() || '';
                $layout.replaceWith(innerHtml);
                return;
            }
            let cells = '';
            $cells.each((_, cell) => {
                const cellHtml = $(cell).find('> div.innerCell').html() || '';
                cells += `<div data-type="column">${cellHtml}</div>`;
            });
            $layout.replaceWith(`<div data-type="columns" data-layout="${sectionType}">${cells}</div>`);
        });
        $root.find('p').each((_, el) => {
            const $p = $(el);
            const content = $p.html()?.trim();
            if (content === '<br>' || content === '<br/>' || content === '<br />') {
                $p.remove();
            }
        });
        $root.find('p, h1, h2, h3, h4, h5, h6').each((_, el) => {
            const $el = $(el);
            const style = $el.attr('style');
            if (!style)
                return;
            const match = style.match(/margin-left\s*:\s*(-?\d*\.?\d+)\s*px/i);
            if (!match)
                return;
            const px = parseFloat(match[1]);
            if (!Number.isFinite(px) || px <= 0)
                return;
            const level = Math.min(8, Math.max(1, Math.round(px / 30)));
            $el.attr('data-indent', String(level));
            const remaining = style
                .replace(/margin-left\s*:\s*-?\d*\.?\d+\s*px\s*;?/i, '')
                .trim();
            if (remaining) {
                $el.attr('style', remaining);
            }
            else {
                $el.removeAttr('style');
            }
        });
        $root.find('img.userLogo').each((_, el) => {
            const $img = $(el);
            $img.attr('width', '48');
            $img.attr('height', '48');
        });
        $root.find('ul.childpages-macro').each((_, el) => {
            const $el = $(el);
            const $subpages = $('<div>').attr('data-type', 'subpages');
            $el.replaceWith($subpages);
        });
        const convertTaskList = ($old) => {
            const $new = $('<ul>').attr('data-type', 'taskList');
            $old.find('> li').each((_, li) => {
                const $li = $(li);
                const isChecked = $li.hasClass('checked');
                const $placeholder = $li.find('span.placeholder-inline-tasks').first();
                const $clone = $li.clone();
                $clone.find('ul.inline-task-list').remove();
                const innerHtml = $placeholder.html()?.trim() || $clone.html()?.trim() || '';
                const $item = $('<li>')
                    .attr('data-type', 'taskItem')
                    .attr('data-checked', String(isChecked));
                const $label = $('<label>');
                const $input = $('<input type="checkbox">').prop('checked', isChecked);
                $label.append($input, $('<span>'));
                const $container = $('<div>');
                $container.append($('<p>').html(innerHtml));
                $item.append($label, $container);
                $li.find('> ul.inline-task-list').each((_, nestedUl) => {
                    const $nestedUl = $(nestedUl);
                    const $convertedNested = convertTaskList($nestedUl);
                    $item.append($convertedNested);
                });
                $new.append($item);
            });
            return $new;
        };
        $root.find('ul.inline-task-list').each((_, oldList) => {
            const $old = $(oldList);
            const $new = convertTaskList($old);
            $old.replaceWith($new);
        });
        $root
            .find('div.confluence-information-macro')
            .get()
            .reverse()
            .forEach((el) => {
            const $macro = $(el);
            let type = 'info';
            if ($macro.hasClass('confluence-information-macro-tip')) {
                type = 'success';
            }
            else if ($macro.hasClass('confluence-information-macro-warning')) {
                type = 'warning';
            }
            const $body = $macro.find('.confluence-information-macro-body').first();
            if (!$body.length || !$body.text().trim()) {
                $macro.remove();
                return;
            }
            const $wrapper = $('<div>')
                .attr('data-type', 'callout')
                .attr('data-callout-type', type);
            $body.contents().each((_, node) => {
                $wrapper.append(node);
            });
            $macro.replaceWith($wrapper);
        });
        $root
            .find('a.confluence-embedded-file[data-media-type="file"] img')
            .remove();
        $root
            .find('div.expand-container')
            .get()
            .reverse()
            .forEach((el) => {
            const $exp = $(el);
            const title = $exp
                .find('.expand-control .expand-control-text')
                .first()
                .text()
                .trim();
            const contents = $exp.find('.expand-content').contents().get();
            const $details = $('<details>').attr('open', '');
            const $summary = $('<summary>')
                .attr('data-type', 'detailsSummary')
                .text(title);
            const $content = $('<div>').attr('data-type', 'detailsContent');
            contents.forEach((node) => $content.append(node));
            $details.append($summary, $content);
            $exp.replaceWith($details);
        });
        $root
            .find('td[data-highlight-colour], th[data-highlight-colour]')
            .each((_, cell) => {
            const $cell = $(cell);
            const confluenceColor = $cell.attr('data-highlight-colour');
            if (confluenceColor) {
                $cell.attr('data-background-color', confluenceColor);
                $cell.removeAttr('data-highlight-colour');
            }
        });
        $root.find('span.status-macro').each((_, el) => {
            const $span = $(el);
            const classList = ($span.attr('class') || '').split(/\s+/);
            let color = 'gray';
            for (const cls of classList) {
                if (confluence_import_utils_1.confluenceStatusColorMap[cls]) {
                    color = confluence_import_utils_1.confluenceStatusColorMap[cls];
                    break;
                }
            }
            const text = $span.text().trim();
            const $status = $('<span>')
                .attr('data-type', 'status')
                .attr('data-color', color)
                .text(text);
            $span.replaceWith($status);
        });
        $root.find('img.emoticon').each((_, img) => {
            const $img = $(img);
            const fallback = $img.attr('data-emoji-fallback');
            if (fallback && !fallback.startsWith(':')) {
                $img.replaceWith(this.normalizeEmoji(fallback));
                return;
            }
            const rawName = $img.attr('data-emoticon-name') ||
                ($img.attr('alt') || '').replace(/^\(|\)$/g, '');
            const name = rawName.replace(/[\s_]/g, '-');
            const mapped = confluence_import_utils_1.confluenceEmoticonMap[name];
            if (mapped) {
                $img.replaceWith(mapped);
                return;
            }
            $img.replaceWith($img.attr('alt') ?? '');
        });
    }
    normalizeEmoji(raw) {
        const unicodeEscapeRe = /^(?:\\u[0-9A-Fa-f]{4})+$/;
        if (unicodeEscapeRe.test(raw)) {
            return raw.replace(/\\u([\dA-Fa-f]{4})/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)));
        }
        else {
            return raw;
        }
    }
    extractAttachmentsMacroAndCleanHtml(html) {
        const $ = (0, cheerio_1.load)(html);
        const attachments = [];
        const attachmentSection = $('#attachments').closest('div.pageSection');
        if (attachmentSection.length) {
            const mimeTypeRegex = /\(([^)]+)\)/;
            const links = attachmentSection.find('div.greybox a').toArray();
            for (const el of links) {
                const $a = $(el);
                const href = $a.attr('href');
                if (!href)
                    continue;
                const fileName = $a.text().trim();
                if (!fileName)
                    continue;
                if (fileName.endsWith('.tmp') || fileName.includes('~drawio~')) {
                    continue;
                }
                const nextTextNode = el.nextSibling;
                let mimeType = '';
                if (nextTextNode && nextTextNode.nodeType === 3) {
                    const match = mimeTypeRegex.exec(nextTextNode.nodeValue || '');
                    mimeType = match ? match[1] : '';
                }
                if (mimeType) {
                    attachments.push({
                        href: href.trim(),
                        fileName: fileName,
                        mimeType: mimeType.trim(),
                    });
                }
            }
            attachmentSection.remove();
        }
        return {
            attachments,
            cleanedHtml: $.html(),
        };
    }
    resolveWithinExtractDir(extractDir, href) {
        const root = path.resolve(extractDir);
        const abs = path.resolve(root, href);
        if (abs !== root && !abs.startsWith(root + path.sep)) {
            throw new common_1.BadRequestException('Invalid import file path');
        }
        return abs;
    }
    async parseConfluenceIndex(extractDir) {
        const indexHtml = await fs_1.promises.readFile(path.join(extractDir, 'index.html'), 'utf-8');
        const $ = (0, cheerio_1.load)(indexHtml);
        const pagesSection = $('div.pageSection')
            .filter((_, sec) => $(sec).find('h2.pageSectionTitle').text().trim() ===
            'Available Pages:')
            .first();
        if (!pagesSection.length) {
            return [];
        }
        const rootUl = pagesSection.find('ul').first();
        if (!rootUl.length) {
            return [];
        }
        const parseUl = (ulElem) => {
            return $(ulElem)
                .children('li')
                .map((_, liElem) => {
                const $li = $(liElem);
                const $a = $li.children('a').first();
                const node = {
                    href: $a.attr('href'),
                    title: $a.text().trim(),
                    children: [],
                };
                $li.children('ul').each((_, childUl) => {
                    node.children.push(...parseUl(childUl));
                });
                return node;
            })
                .get();
        };
        const tree = parseUl(rootUl.get(0));
        if (tree.length === 1 && tree[0].children.length > 0) {
            const root = { ...tree[0], children: [] };
            return [root, ...tree[0].children];
        }
        return tree;
    }
    async formatImportHtml(opts) {
        const { html, currentFilePath, filePathToPageMetaMap, creatorId, sourcePageId, workspaceId, anchorMap, spaceSlug, } = opts;
        const $ = (0, cheerio_1.load)(html);
        const $root = $.root();
        this.confluenceFormatter($, $root, currentFilePath, anchorMap, filePathToPageMetaMap, spaceSlug);
        (0, import_formatter_1.defaultHtmlFormatter)($, $root);
        const backlinks = await (0, import_formatter_1.rewriteInternalLinksToMentionHtml)($, $root, currentFilePath, filePathToPageMetaMap, creatorId, sourcePageId, workspaceId, spaceSlug);
        return {
            html: $root.html() || '',
            backlinks,
        };
    }
    async collectConfluenceAnchors(extractDir, pageHrefs) {
        const anchorMap = new Map();
        for (const href of pageHrefs) {
            const abs = this.resolveWithinExtractDir(extractDir, href);
            try {
                const html = await fs_1.promises.readFile(abs, 'utf-8');
                const $ = (0, cheerio_1.load)(html);
                $('span.confluence-anchor-link[id]').each((_, el) => {
                    const anchorId = $(el).attr('id');
                    if (anchorId) {
                        const key = `${href}#${anchorId}`;
                        anchorMap.set(key, (0, editor_ext_1.generateNodeId)());
                    }
                });
            }
            catch {
            }
        }
        return anchorMap;
    }
    processConfluenceAnchors($, $root, currentFilePath, anchorMap, filePathToPageMetaMap, spaceSlug) {
        $root.find('span.confluence-anchor-link').each((_, el) => {
            const $span = $(el);
            const anchorId = $span.attr('id');
            if (!anchorId)
                return;
            const key = `${currentFilePath}#${anchorId}`;
            const nodeId = anchorMap.get(key);
            if (!nodeId)
                return;
            const content = $span.text().trim() || '⚓';
            const $p = $('<p>').attr('data-id', nodeId).text(content);
            $span.replaceWith($p);
        });
        $root.find('a[href*="#"]').each((_, el) => {
            const $a = $(el);
            const href = $a.attr('href');
            if (!href || href.startsWith('http'))
                return;
            const hashIndex = href.indexOf('#');
            if (hashIndex === -1)
                return;
            const pagePart = href.substring(0, hashIndex);
            const anchorPart = href.substring(hashIndex + 1);
            if (!anchorPart)
                return;
            const resolvedPage = pagePart
                ? path.join(path.dirname(currentFilePath), pagePart).replace(/\\/g, '/')
                : currentFilePath;
            const key = `${resolvedPage}#${anchorPart}`;
            const nodeId = anchorMap.get(key);
            if (!nodeId)
                return;
            const targetMeta = filePathToPageMetaMap.get(resolvedPage);
            if (!targetMeta)
                return;
            const linkTitle = targetMeta.title || 'untitled';
            const truncatedTitle = linkTitle.substring(0, 70);
            const pageSlug = `${(0, slugify_1.default)(truncatedTitle)}-${targetMeta.slugId}`;
            $a.attr('href', `/s/${spaceSlug}/p/${pageSlug}#${nodeId}`);
            $a.attr('data-internal', 'true');
        });
    }
};
exports.ConfluenceImportService = ConfluenceImportService;
exports.ConfluenceImportService = ConfluenceImportService = ConfluenceImportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(6, (0, nestjs_kysely_1.InjectKysely)()),
    __param(8, (0, common_1.Inject)(audit_service_1.AUDIT_SERVICE)),
    __metadata("design:paramtypes", [import_service_1.ImportService,
        backlink_repo_1.BacklinkRepo,
        import_attachment_service_1.ImportAttachmentService,
        page_service_1.PageService,
        environment_service_1.EnvironmentService,
        license_check_service_1.LicenseCheckService, Object, event_emitter_1.EventEmitter2, Object])
], ConfluenceImportService);
//# sourceMappingURL=confluence-import.service.js.map