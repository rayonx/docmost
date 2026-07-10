import { PageService } from '../../core/page/services/page.service';
import { PageRepo } from "../../database/repos/page/page.repo";
import { SpaceRepo } from "../../database/repos/space/space.repo";
import { SpaceMemberService } from '../../core/space/services/space-member.service';
import { PageAccessService } from '../../core/page/page-access/page-access.service';
import { SearchService } from '../../core/search/search.service';
import SpaceAbilityFactory from '../../core/casl/abilities/space-ability.factory';
import { EnvironmentService } from '../../integrations/environment/environment.service';
import { PageSearchService } from '../typesense/services/page-search.service';
import { AiSearchService } from '../ai/services/ai-search.service';
import { User, Workspace } from "../../database/types/entity.types";
import { PagePermissionRepo } from "../../database/repos/page/page-permission.repo";
export declare class AiChatToolsService {
    private readonly pageRepo;
    private readonly spaceRepo;
    private readonly spaceMemberService;
    private readonly pageService;
    private readonly pageAccessService;
    private readonly searchService;
    private readonly spaceAbility;
    private readonly environmentService;
    private readonly pageSearchService;
    private readonly aiSearchService;
    private readonly pagePermissionRepo;
    constructor(pageRepo: PageRepo, spaceRepo: SpaceRepo, spaceMemberService: SpaceMemberService, pageService: PageService, pageAccessService: PageAccessService, searchService: SearchService, spaceAbility: SpaceAbilityFactory, environmentService: EnvironmentService, pageSearchService: PageSearchService, aiSearchService: AiSearchService, pagePermissionRepo: PagePermissionRepo);
    createTools(user: User, workspace: Workspace, pageJsonCache?: Map<string, any>, userMessage?: string): {
        list_spaces: import("ai").Tool<Record<string, never>, {
            spaces: {
                id: string;
                name: string;
                slug: string;
                description: string;
            }[];
            error?: undefined;
        } | {
            error: string;
            spaces?: undefined;
        }>;
        get_space: import("ai").Tool<{
            spaceId: string;
        }, {
            error: string;
            id?: undefined;
            name?: undefined;
            slug?: undefined;
            description?: undefined;
            visibility?: undefined;
            createdAt?: undefined;
        } | {
            id: string;
            name: string;
            slug: string;
            description: string;
            visibility: string;
            createdAt: Date;
            error?: undefined;
        }>;
        semantic_search: import("ai").Tool<{
            query: string;
            limit: number;
        }, {
            error: string;
            chunks?: undefined;
            message?: undefined;
        } | {
            chunks: any[];
            message: string;
            error?: undefined;
        } | {
            chunks: {
                pageId: any;
                title: any;
                icon: any;
                slugId: any;
                spaceSlug: any;
                similarity: number;
                excerpt: string;
            }[];
            error?: undefined;
            message?: undefined;
        }>;
        search_pages: import("ai").Tool<{
            query: string;
            limit: number;
        }, {
            pages: any;
            error?: undefined;
        } | {
            error: string;
            pages?: undefined;
        }>;
        list_recent_pages: import("ai").Tool<{
            limit: number;
        }, {
            pages: {
                id: any;
                title: any;
                icon: any;
                slugId: any;
                spaceSlug: any;
                createdAt: any;
                updatedAt: any;
            }[];
            error?: undefined;
        } | {
            error: string;
            pages?: undefined;
        }>;
        get_page: import("ai").Tool<{
            pageId: string;
        }, {
            error: string;
        } | {
            content: string;
            id: string;
            title: string;
            icon: string;
            slugId: string;
            spaceSlug: any;
            creator: any;
            createdAt: Date;
            updatedAt: Date;
            error?: undefined;
        } | {
            tableOfContents: string;
            note: string;
            id: string;
            title: string;
            icon: string;
            slugId: string;
            spaceSlug: any;
            creator: any;
            createdAt: Date;
            updatedAt: Date;
            error?: undefined;
        }>;
        create_page: import("ai").Tool<{
            title: string;
            spaceId: string;
            content?: string;
            parentPageId?: string;
        }, {
            error: string;
            id?: undefined;
            title?: undefined;
            icon?: undefined;
            slugId?: undefined;
            spaceId?: undefined;
            spaceSlug?: undefined;
        } | {
            id: string;
            title: string;
            icon: string;
            slugId: string;
            spaceId: string;
            spaceSlug: string;
            error?: undefined;
        }>;
        update_page: import("ai").Tool<{
            pageId: string;
            operation: "replace" | "append" | "prepend";
            title?: string;
            content?: string;
        }, {
            error: string;
            id?: undefined;
            title?: undefined;
            icon?: undefined;
            slugId?: undefined;
            spaceSlug?: undefined;
        } | {
            id: string;
            title: string;
            icon: any;
            slugId: string;
            spaceSlug: any;
            error?: undefined;
        }>;
        read_page_sections: import("ai").Tool<{
            pageId: string;
            sectionIds: string[];
        }, {
            error: string;
            sections?: undefined;
        } | {
            sections: {
                content: string;
                id: string;
                title: string;
                truncated: boolean;
            }[];
            error?: undefined;
        }>;
        search_in_page: import("ai").Tool<{
            pageId: string;
            query: string;
        }, {
            error: string;
            matches?: undefined;
        } | {
            matches: {
                snippet: string;
                sectionId: string;
                sectionTitle: string;
            }[];
            error?: undefined;
        }>;
    };
    private searchTypesense;
}
