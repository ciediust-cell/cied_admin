const envApiOrigin =
  (
    import.meta as ImportMeta & {
      env?: Record<string, string | undefined>;
    }
  ).env?.VITE_API_ORIGIN ?? "";

const normalizedApiOrigin = envApiOrigin.trim();

if (!normalizedApiOrigin) {
  throw new Error("Missing VITE_API_ORIGIN. Set it in your .env file.");
}

export const API_ORIGIN = normalizedApiOrigin.replace(/\/+$/, "");
export const ADMIN_API_BASE = `${API_ORIGIN}/api/admin`;

type Guard<T> = (value: unknown) => value is T;

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseErrorMessage(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  if (!isString(payload.message)) return null;
  return payload.message;
}

async function parseJsonPayload(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit,
  validator: Guard<T> | null,
  invalidMessage: string,
): Promise<T> {
  const response = await fetch(`${ADMIN_API_BASE}${path}`, options);
  const payload = await parseJsonPayload(response);

  if (!response.ok) {
    throw new ApiError(
      parseErrorMessage(payload) ?? `Request failed with status ${response.status}`,
      response.status,
      payload,
    );
  }

  if (!validator) {
    return payload as T;
  }

  if (!validator(payload)) {
    throw new ApiError(invalidMessage, response.status, payload);
  }

  return payload;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return fallback;
}

export interface LoginResponse {
  accessToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface AdminProfileResponse {
  email: string;
  role?: string;
  updatedAt?: string;
}

interface AdminProfileContainer {
  email?: string;
}

export interface UpdateAdminProfileResponse {
  message?: string;
  admin?: AdminProfileContainer;
}

export interface ChangePasswordResponse {
  message?: string;
}

export interface ForgotPasswordResponse {
  message: string;
  resetToken?: string;
  resetUrl?: string | null;
}

export interface ResetPasswordResponse {
  message: string;
}

export type ActivityType = "enquiry" | "event" | "news" | "gallery" | "program";

export interface DashboardStatsResponse {
  totalNews: number;
  totalEvents: number;
  totalPrograms: number;
  totalGalleryAlbums: number;
  totalEnquiries: number;
}

export interface DashboardRecentActivityResponse {
  id: string;
  type: ActivityType;
  action: string;
  createdAt: string;
}

export interface DashboardSummaryResponse {
  stats: DashboardStatsResponse;
  recentActivity: DashboardRecentActivityResponse[];
}

export interface EnquiryResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

const ACTIVITY_TYPES: ReadonlySet<ActivityType> = new Set([
  "enquiry",
  "event",
  "news",
  "gallery",
  "program",
]);

function isLoginResponse(payload: unknown): payload is LoginResponse {
  return isRecord(payload) && isString(payload.accessToken);
}

function isRefreshResponse(payload: unknown): payload is RefreshResponse {
  return isRecord(payload) && isString(payload.accessToken);
}

function isAdminProfileResponse(payload: unknown): payload is AdminProfileResponse {
  if (!isRecord(payload)) return false;
  if (!isString(payload.email)) return false;
  if (payload.role !== undefined && !isString(payload.role)) return false;
  if (payload.updatedAt !== undefined && !isString(payload.updatedAt)) return false;
  return true;
}

function isUpdateAdminProfileResponse(
  payload: unknown,
): payload is UpdateAdminProfileResponse {
  if (!isRecord(payload)) return false;
  if (payload.message !== undefined && !isString(payload.message)) return false;

  if (payload.admin !== undefined) {
    if (!isRecord(payload.admin)) return false;
    if (payload.admin.email !== undefined && !isString(payload.admin.email)) {
      return false;
    }
  }

  return true;
}

function isChangePasswordResponse(payload: unknown): payload is ChangePasswordResponse {
  if (payload === null) return true;
  if (!isRecord(payload)) return false;
  if (payload.message !== undefined && !isString(payload.message)) return false;
  return true;
}

function isForgotPasswordResponse(
  payload: unknown,
): payload is ForgotPasswordResponse {
  if (!isRecord(payload)) return false;
  if (!isString(payload.message)) return false;
  if (payload.resetToken !== undefined && !isString(payload.resetToken)) return false;
  if (
    payload.resetUrl !== undefined &&
    payload.resetUrl !== null &&
    !isString(payload.resetUrl)
  ) {
    return false;
  }
  return true;
}

function isResetPasswordResponse(payload: unknown): payload is ResetPasswordResponse {
  return isRecord(payload) && isString(payload.message);
}

function isDashboardStatsResponse(payload: unknown): payload is DashboardStatsResponse {
  if (!isRecord(payload)) return false;
  return (
    isNumber(payload.totalNews) &&
    isNumber(payload.totalEvents) &&
    isNumber(payload.totalPrograms) &&
    isNumber(payload.totalGalleryAlbums) &&
    isNumber(payload.totalEnquiries)
  );
}

function isDashboardRecentActivityResponse(
  payload: unknown,
): payload is DashboardRecentActivityResponse {
  if (!isRecord(payload)) return false;
  if (!isString(payload.id)) return false;
  if (!isString(payload.type) || !ACTIVITY_TYPES.has(payload.type as ActivityType)) {
    return false;
  }
  if (!isString(payload.action)) return false;
  if (!isString(payload.createdAt)) return false;
  return true;
}

function isDashboardSummaryResponse(
  payload: unknown,
): payload is DashboardSummaryResponse {
  if (!isRecord(payload)) return false;
  if (!isDashboardStatsResponse(payload.stats)) return false;
  if (!Array.isArray(payload.recentActivity)) return false;
  return payload.recentActivity.every(isDashboardRecentActivityResponse);
}

function isEnquiryResponse(payload: unknown): payload is EnquiryResponse {
  if (!isRecord(payload)) return false;

  const phone = payload.phone;
  const validPhone = phone === null || isString(phone);

  return (
    isString(payload.id) &&
    isString(payload.fullName) &&
    isString(payload.email) &&
    validPhone &&
    isString(payload.subject) &&
    isString(payload.message) &&
    isString(payload.createdAt) &&
    isBoolean(payload.isRead)
  );
}

function isEnquiriesResponse(payload: unknown): payload is EnquiryResponse[] {
  return Array.isArray(payload) && payload.every(isEnquiryResponse);
}

export function validateRefreshPayload(payload: unknown): payload is RefreshResponse {
  return isRefreshResponse(payload);
}

export async function loginAdmin(payload: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  return request(
    "/auth/login",
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    isLoginResponse,
    "Invalid login response format",
  );
}

export async function forgotAdminPassword(payload: {
  email: string;
}): Promise<ForgotPasswordResponse> {
  return request(
    "/auth/forgot-password",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    isForgotPasswordResponse,
    "Invalid forgot password response format",
  );
}

export async function resetAdminPassword(payload: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ResetPasswordResponse> {
  return request(
    "/auth/reset-password",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    isResetPasswordResponse,
    "Invalid reset password response format",
  );
}

export async function refreshAdminSession(): Promise<RefreshResponse> {
  return request(
    "/auth/refresh",
    {
      method: "POST",
      credentials: "include",
    },
    isRefreshResponse,
    "Invalid refresh response format",
  );
}

export async function logoutAdmin(): Promise<void> {
  await request(
    "/auth/logout",
    {
      method: "POST",
      credentials: "include",
    },
    null,
    "Invalid logout response format",
  );
}

export async function getAdminProfile(): Promise<AdminProfileResponse> {
  return request(
    "/me",
    {
      method: "GET",
    },
    isAdminProfileResponse,
    "Invalid profile response format",
  );
}

export async function updateAdminProfile(payload: {
  email: string;
}): Promise<UpdateAdminProfileResponse> {
  return request(
    "/me",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    isUpdateAdminProfileResponse,
    "Invalid profile update response format",
  );
}

export async function changeAdminPassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ChangePasswordResponse> {
  return request(
    "/change-password",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
    isChangePasswordResponse,
    "Invalid password change response format",
  );
}

export async function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  return request(
    "/dashboard/summary",
    {
      method: "GET",
    },
    isDashboardSummaryResponse,
    "Invalid dashboard response format",
  );
}

export async function getAdminEnquiries(): Promise<EnquiryResponse[]> {
  return request(
    "/enquiries",
    {
      method: "GET",
    },
    isEnquiriesResponse,
    "Invalid enquiries response format",
  );
}

export async function getAdminEnquiriesPaginated(params: {
  page: number;
  limit: number;
}): Promise<PaginatedResponse<EnquiryResponse>> {
  const query = buildPaginationQuery(params);
  return request(
    `/enquiries?${query}`,
    {
      method: "GET",
    },
    isPaginatedEnquiryListResponse,
    "Invalid paginated enquiries response format",
  );
}

export async function markEnquiryAsRead(id: string): Promise<void> {
  await request(
    `/enquiries/${id}/read`,
    {
      method: "PATCH",
    },
    null,
    "Invalid mark-as-read response format",
  );
}

export async function deleteAdminEnquiry(id: string): Promise<void> {
  await request(
    `/enquiries/${id}`,
    {
      method: "DELETE",
    },
    null,
    "Invalid enquiry delete response format",
  );
}

export type MemberRole = "GOVERNANCE" | "MANAGEMENT" | "MENTOR" | "ADVISOR";

export type GalleryCategory =
  | "INFRASTRUCTURE"
  | "EVENTS"
  | "NEWS"
  | "WORKSPACE"
  | "FACILITIES"
  | "ACTIVITIES"
  | "OTHER";

export type StartupStage = "IDEATION" | "EARLY_STAGE" | "GROWTH";

export type StartupSector =
  | "AI"
  | "TECHNOLOGY"
  | "AGRICULTURE"
  | "HEALTHTECH"
  | "EDTECH"
  | "ECOMMERCE"
  | "SOCIAL_IMPACT";

export interface NewsItemResponse {
  id: string;
  title: string;
  isPublished: boolean;
  newsDate: string;
  createdAt: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string | null;
  featuredImageId?: string | null;
}

export interface EventItemResponse {
  id: string;
  title: string;
  eventDate: string;
  location: string | null;
  isPublished: boolean;
}

export interface EventDetailResponse {
  id: string;
  title: string;
  description?: string | null;
  eventDate?: string | null;
  location?: string | null;
  registrationUrl?: string | null;
  featuredImage?: string | null;
  isPublished: boolean;
}

export interface ProgramItemResponse {
  id: string;
  title: string;
  shortDescription: string;
  duration: string;
  eligibility: string;
  applyEnabled: boolean;
  isActive: boolean;
  updatedAt: string;
}

export interface ProgramHighlightResponse {
  text: string;
}

export interface ProgramApplicationStepResponse {
  stepNumber?: number;
  description: string;
}

export interface ProgramDetailResponse {
  id: string;
  title: string | null;
  shortDescription?: string | null;
  overview?: string | null;
  duration?: string | null;
  eligibility?: string | null;
  icon?: string | null;
  applyEnabled: boolean;
  applyUrl?: string | null;
  highlights?: ProgramHighlightResponse[];
  applicationSteps?: ProgramApplicationStepResponse[];
}

export interface ProgramToggleResponse {
  program: {
    isActive: boolean;
  };
}

export interface ProgramUpsertPayload {
  title: string;
  shortDescription: string;
  overview: string;
  duration: string;
  eligibility: string;
  icon?: string;
  applyEnabled: boolean;
  applyUrl?: string;
  highlights: string[];
  applicationSteps: string[];
}

export interface MemberResponse {
  id: string;
  name: string;
  designation: string;
  role: MemberRole;
  imageUrl: string;
  order: number;
  isActive: boolean;
  description?: string | null;
  email?: string | null;
  linkedinUrl?: string | null;
  imagePublicId?: string | null;
}

export interface MemberUpsertPayload {
  name?: string;
  designation?: string;
  role?: MemberRole;
  isActive?: boolean;
  description?: string;
  email?: string;
  linkedinUrl?: string;
  order?: number;
  imageUrl?: string;
  imagePublicId?: string;
}

export interface UploadImageResponse {
  imageUrl: string;
  publicId: string;
}

export interface GalleryImageResponse {
  id: string;
  imageUrl: string;
  caption?: string | null;
}

export interface GalleryAlbumResponse {
  id: string;
  title: string;
  subtitle: string;
  category: GalleryCategory;
  isActive: boolean;
  coverImage: GalleryImageResponse | null;
  images: GalleryImageResponse[];
  updatedAt: string;
}

export interface GalleryDetailResponse {
  id: string;
  title: string;
  subtitle: string;
  category: GalleryCategory;
  coverImageId: string | null;
  images: GalleryImageResponse[];
}

export interface GalleryCreateResponse {
  gallery: {
    id: string;
  };
}

export interface GalleryToggleResponse {
  gallery: {
    isActive: boolean;
  };
}

export interface GalleryCoverResponse {
  gallery: {
    coverImageId: string | null;
  };
}

export interface PortfolioFounderResponse {
  id: string;
  name: string;
}

export interface PortfolioAchievementResponse {
  id: string;
  text: string;
}

export interface PortfolioItemResponse {
  id: string;
  name: string;
  tagline: string;
  description?: string;
  logo: string;
  websiteUrl?: string;
  stage: StartupStage;
  sectors: StartupSector[];
  founders: PortfolioFounderResponse[];
  achievements: PortfolioAchievementResponse[];
  isActive: boolean;
}

export interface AwardResponse {
  id: string;
  title: string;
  year: number;
  description: string;
  awardedBy: string;
  featuredImage?: string | null;
  featuredImageId?: string | null;
  order: number;
  isActive: boolean;
}

export interface AwardUpsertPayload {
  title: string;
  awardedBy: string;
  year: number;
  description: string;
  isActive: boolean;
  order?: number;
}

const MEMBER_ROLES: ReadonlySet<MemberRole> = new Set([
  "GOVERNANCE",
  "MANAGEMENT",
  "MENTOR",
  "ADVISOR",
]);

const GALLERY_CATEGORIES: ReadonlySet<GalleryCategory> = new Set([
  "INFRASTRUCTURE",
  "EVENTS",
  "NEWS",
  "WORKSPACE",
  "FACILITIES",
  "ACTIVITIES",
  "OTHER",
]);

const STARTUP_STAGES: ReadonlySet<StartupStage> = new Set([
  "IDEATION",
  "EARLY_STAGE",
  "GROWTH",
]);

const STARTUP_SECTORS: ReadonlySet<StartupSector> = new Set([
  "AI",
  "TECHNOLOGY",
  "AGRICULTURE",
  "HEALTHTECH",
  "EDTECH",
  "ECOMMERCE",
  "SOCIAL_IMPACT",
]);

function isNewsItemResponse(payload: unknown): payload is NewsItemResponse {
  if (!isRecord(payload)) return false;
  if (!isString(payload.id)) return false;
  if (!isString(payload.title)) return false;
  if (!isBoolean(payload.isPublished)) return false;
  if (!isString(payload.newsDate)) return false;
  if (!isString(payload.createdAt)) return false;
  if (payload.excerpt !== undefined && !isString(payload.excerpt)) return false;
  if (payload.content !== undefined && !isString(payload.content)) return false;
  if (
    payload.featuredImage !== undefined &&
    payload.featuredImage !== null &&
    !isString(payload.featuredImage)
  ) {
    return false;
  }
  if (
    payload.featuredImageId !== undefined &&
    payload.featuredImageId !== null &&
    !isString(payload.featuredImageId)
  ) {
    return false;
  }
  return true;
}

function isNewsListResponse(payload: unknown): payload is NewsItemResponse[] {
  return Array.isArray(payload) && payload.every(isNewsItemResponse);
}

function isEventItemResponse(payload: unknown): payload is EventItemResponse {
  if (!isRecord(payload)) return false;
  const validLocation = payload.location === null || isString(payload.location);
  return (
    isString(payload.id) &&
    isString(payload.title) &&
    isString(payload.eventDate) &&
    validLocation &&
    isBoolean(payload.isPublished)
  );
}

function isEventListResponse(payload: unknown): payload is EventItemResponse[] {
  return Array.isArray(payload) && payload.every(isEventItemResponse);
}

function isEventDetailResponse(payload: unknown): payload is EventDetailResponse {
  if (!isRecord(payload)) return false;
  if (!isString(payload.id)) return false;
  if (!isString(payload.title)) return false;
  if (!isBoolean(payload.isPublished)) return false;
  if (
    payload.description !== undefined &&
    payload.description !== null &&
    !isString(payload.description)
  ) {
    return false;
  }
  if (
    payload.eventDate !== undefined &&
    payload.eventDate !== null &&
    !isString(payload.eventDate)
  ) {
    return false;
  }
  if (
    payload.location !== undefined &&
    payload.location !== null &&
    !isString(payload.location)
  ) {
    return false;
  }
  if (
    payload.registrationUrl !== undefined &&
    payload.registrationUrl !== null &&
    !isString(payload.registrationUrl)
  ) {
    return false;
  }
  if (
    payload.featuredImage !== undefined &&
    payload.featuredImage !== null &&
    !isString(payload.featuredImage)
  ) {
    return false;
  }
  return true;
}

function isProgramItemResponse(payload: unknown): payload is ProgramItemResponse {
  if (!isRecord(payload)) return false;
  return (
    isString(payload.id) &&
    isString(payload.title) &&
    isString(payload.shortDescription) &&
    isString(payload.duration) &&
    isString(payload.eligibility) &&
    isBoolean(payload.applyEnabled) &&
    isBoolean(payload.isActive) &&
    isString(payload.updatedAt)
  );
}

function isProgramListResponse(payload: unknown): payload is ProgramItemResponse[] {
  return Array.isArray(payload) && payload.every(isProgramItemResponse);
}

function isProgramHighlightResponse(payload: unknown): payload is ProgramHighlightResponse {
  return isRecord(payload) && isString(payload.text);
}

function isProgramApplicationStepResponse(
  payload: unknown,
): payload is ProgramApplicationStepResponse {
  if (!isRecord(payload)) return false;
  if (!isString(payload.description)) return false;
  if (payload.stepNumber !== undefined && !isNumber(payload.stepNumber)) {
    return false;
  }
  return true;
}

function isProgramDetailResponse(payload: unknown): payload is ProgramDetailResponse {
  if (!isRecord(payload)) return false;
  if (!isString(payload.id)) return false;
  if (payload.title !== null && !isString(payload.title)) return false;
  if (!isBoolean(payload.applyEnabled)) return false;

  if (
    payload.shortDescription !== undefined &&
    payload.shortDescription !== null &&
    !isString(payload.shortDescription)
  ) {
    return false;
  }
  if (
    payload.overview !== undefined &&
    payload.overview !== null &&
    !isString(payload.overview)
  ) {
    return false;
  }
  if (
    payload.duration !== undefined &&
    payload.duration !== null &&
    !isString(payload.duration)
  ) {
    return false;
  }
  if (
    payload.eligibility !== undefined &&
    payload.eligibility !== null &&
    !isString(payload.eligibility)
  ) {
    return false;
  }
  if (payload.icon !== undefined && payload.icon !== null && !isString(payload.icon)) {
    return false;
  }
  if (
    payload.applyUrl !== undefined &&
    payload.applyUrl !== null &&
    !isString(payload.applyUrl)
  ) {
    return false;
  }
  if (
    payload.highlights !== undefined &&
    (!Array.isArray(payload.highlights) ||
      !payload.highlights.every(isProgramHighlightResponse))
  ) {
    return false;
  }
  if (
    payload.applicationSteps !== undefined &&
    (!Array.isArray(payload.applicationSteps) ||
      !payload.applicationSteps.every(isProgramApplicationStepResponse))
  ) {
    return false;
  }
  return true;
}

function isProgramToggleResponse(payload: unknown): payload is ProgramToggleResponse {
  return (
    isRecord(payload) &&
    isRecord(payload.program) &&
    isBoolean(payload.program.isActive)
  );
}

function isMemberResponse(payload: unknown): payload is MemberResponse {
  if (!isRecord(payload)) return false;
  if (!isString(payload.id)) return false;
  if (!isString(payload.name)) return false;
  if (!isString(payload.designation)) return false;
  if (!isString(payload.role) || !MEMBER_ROLES.has(payload.role as MemberRole)) {
    return false;
  }
  if (!isString(payload.imageUrl)) return false;
  if (!isNumber(payload.order)) return false;
  if (!isBoolean(payload.isActive)) return false;
  if (
    payload.description !== undefined &&
    payload.description !== null &&
    !isString(payload.description)
  ) {
    return false;
  }
  if (payload.email !== undefined && payload.email !== null && !isString(payload.email)) {
    return false;
  }
  if (
    payload.linkedinUrl !== undefined &&
    payload.linkedinUrl !== null &&
    !isString(payload.linkedinUrl)
  ) {
    return false;
  }
  if (
    payload.imagePublicId !== undefined &&
    payload.imagePublicId !== null &&
    !isString(payload.imagePublicId)
  ) {
    return false;
  }
  return true;
}

function isMembersResponse(payload: unknown): payload is MemberResponse[] {
  return Array.isArray(payload) && payload.every(isMemberResponse);
}

function isUploadImageResponse(payload: unknown): payload is UploadImageResponse {
  return isRecord(payload) && isString(payload.imageUrl) && isString(payload.publicId);
}

function isGalleryImageResponse(payload: unknown): payload is GalleryImageResponse {
  if (!isRecord(payload)) return false;
  if (!isString(payload.id)) return false;
  if (!isString(payload.imageUrl)) return false;
  if (
    payload.caption !== undefined &&
    payload.caption !== null &&
    !isString(payload.caption)
  ) {
    return false;
  }
  return true;
}

function isGalleryAlbumResponse(payload: unknown): payload is GalleryAlbumResponse {
  if (!isRecord(payload)) return false;
  if (!isString(payload.id)) return false;
  if (!isString(payload.title)) return false;
  if (!isString(payload.subtitle)) return false;
  if (
    !isString(payload.category) ||
    !GALLERY_CATEGORIES.has(payload.category as GalleryCategory)
  ) {
    return false;
  }
  if (!isBoolean(payload.isActive)) return false;
  if (!isString(payload.updatedAt)) return false;
  if (payload.coverImage !== null && !isGalleryImageResponse(payload.coverImage)) {
    return false;
  }
  if (!Array.isArray(payload.images) || !payload.images.every(isGalleryImageResponse)) {
    return false;
  }
  return true;
}

function isGalleryAlbumsResponse(payload: unknown): payload is GalleryAlbumResponse[] {
  return Array.isArray(payload) && payload.every(isGalleryAlbumResponse);
}

function isGalleryDetailResponse(payload: unknown): payload is GalleryDetailResponse {
  if (!isRecord(payload)) return false;
  if (!isString(payload.id)) return false;
  if (!isString(payload.title)) return false;
  if (!isString(payload.subtitle)) return false;
  if (
    !isString(payload.category) ||
    !GALLERY_CATEGORIES.has(payload.category as GalleryCategory)
  ) {
    return false;
  }
  if (payload.coverImageId !== null && !isString(payload.coverImageId)) return false;
  if (!Array.isArray(payload.images) || !payload.images.every(isGalleryImageResponse)) {
    return false;
  }
  return true;
}

function isGalleryCreateResponse(payload: unknown): payload is GalleryCreateResponse {
  return isRecord(payload) && isRecord(payload.gallery) && isString(payload.gallery.id);
}

function isGalleryToggleResponse(payload: unknown): payload is GalleryToggleResponse {
  return (
    isRecord(payload) &&
    isRecord(payload.gallery) &&
    isBoolean(payload.gallery.isActive)
  );
}

function isGalleryCoverResponse(payload: unknown): payload is GalleryCoverResponse {
  return (
    isRecord(payload) &&
    isRecord(payload.gallery) &&
    (payload.gallery.coverImageId === null || isString(payload.gallery.coverImageId))
  );
}

function isPortfolioFounderResponse(payload: unknown): payload is PortfolioFounderResponse {
  return isRecord(payload) && isString(payload.id) && isString(payload.name);
}

function isPortfolioAchievementResponse(
  payload: unknown,
): payload is PortfolioAchievementResponse {
  return isRecord(payload) && isString(payload.id) && isString(payload.text);
}

function isPortfolioItemResponse(payload: unknown): payload is PortfolioItemResponse {
  if (!isRecord(payload)) return false;
  if (!isString(payload.id)) return false;
  if (!isString(payload.name)) return false;
  if (!isString(payload.tagline)) return false;
  if (!isString(payload.logo)) return false;
  if (!isBoolean(payload.isActive)) return false;
  if (!isString(payload.stage) || !STARTUP_STAGES.has(payload.stage as StartupStage)) {
    return false;
  }
  if (payload.description !== undefined && !isString(payload.description)) return false;
  if (payload.websiteUrl !== undefined && !isString(payload.websiteUrl)) return false;
  if (
    !Array.isArray(payload.sectors) ||
    !payload.sectors.every(
      (sector) => isString(sector) && STARTUP_SECTORS.has(sector as StartupSector),
    )
  ) {
    return false;
  }
  if (!Array.isArray(payload.founders) || !payload.founders.every(isPortfolioFounderResponse)) {
    return false;
  }
  if (
    !Array.isArray(payload.achievements) ||
    !payload.achievements.every(isPortfolioAchievementResponse)
  ) {
    return false;
  }
  return true;
}

function isPortfolioListResponse(payload: unknown): payload is PortfolioItemResponse[] {
  return Array.isArray(payload) && payload.every(isPortfolioItemResponse);
}

function isAwardResponse(payload: unknown): payload is AwardResponse {
  if (!isRecord(payload)) return false;
  if (
    payload.featuredImage !== undefined &&
    payload.featuredImage !== null &&
    !isString(payload.featuredImage)
  ) {
    return false;
  }
  if (
    payload.featuredImageId !== undefined &&
    payload.featuredImageId !== null &&
    !isString(payload.featuredImageId)
  ) {
    return false;
  }
  return (
    isString(payload.id) &&
    isString(payload.title) &&
    isNumber(payload.year) &&
    isString(payload.description) &&
    isString(payload.awardedBy) &&
    isNumber(payload.order) &&
    isBoolean(payload.isActive)
  );
}

function isAwardsResponse(payload: unknown): payload is AwardResponse[] {
  return Array.isArray(payload) && payload.every(isAwardResponse);
}

function isPaginationMeta(payload: unknown): payload is PaginationMeta {
  if (!isRecord(payload)) return false;
  return (
    isNumber(payload.total) &&
    isNumber(payload.page) &&
    isNumber(payload.limit) &&
    isNumber(payload.totalPages)
  );
}

function createPaginatedResponseValidator<T>(
  itemValidator: Guard<T>,
): Guard<PaginatedResponse<T>> {
  return (payload: unknown): payload is PaginatedResponse<T> => {
    if (!isRecord(payload)) return false;
    if (!Array.isArray(payload.data) || !payload.data.every(itemValidator)) return false;
    if (!isPaginationMeta(payload.pagination)) return false;
    return true;
  };
}

function buildPaginationQuery(params: { page: number; limit: number }): string {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  return searchParams.toString();
}

const isPaginatedNewsListResponse =
  createPaginatedResponseValidator<NewsItemResponse>(isNewsItemResponse);
const isPaginatedEventListResponse =
  createPaginatedResponseValidator<EventItemResponse>(isEventItemResponse);
const isPaginatedProgramListResponse =
  createPaginatedResponseValidator<ProgramItemResponse>(isProgramItemResponse);
const isPaginatedMemberListResponse =
  createPaginatedResponseValidator<MemberResponse>(isMemberResponse);
const isPaginatedGalleryAlbumListResponse =
  createPaginatedResponseValidator<GalleryAlbumResponse>(isGalleryAlbumResponse);
const isPaginatedPortfolioListResponse =
  createPaginatedResponseValidator<PortfolioItemResponse>(isPortfolioItemResponse);
const isPaginatedAwardListResponse =
  createPaginatedResponseValidator<AwardResponse>(isAwardResponse);
const isPaginatedEnquiryListResponse =
  createPaginatedResponseValidator<EnquiryResponse>(isEnquiryResponse);

export async function getAdminNews(): Promise<NewsItemResponse[]> {
  return request(
    "/news",
    { method: "GET" },
    isNewsListResponse,
    "Invalid news response format",
  );
}

export async function getAdminNewsPaginated(params: {
  page: number;
  limit: number;
}): Promise<PaginatedResponse<NewsItemResponse>> {
  const query = buildPaginationQuery(params);
  return request(
    `/news?${query}`,
    { method: "GET" },
    isPaginatedNewsListResponse,
    "Invalid paginated news response format",
  );
}

export async function createAdminNews(formData: FormData): Promise<void> {
  await request(
    "/news",
    { method: "POST", body: formData },
    null,
    "Invalid news create response format",
  );
}

export async function updateAdminNews(id: string, formData: FormData): Promise<void> {
  await request(
    `/news/${id}`,
    { method: "PUT", body: formData },
    null,
    "Invalid news update response format",
  );
}

export async function deleteAdminNews(id: string): Promise<void> {
  await request(
    `/news/${id}`,
    { method: "DELETE" },
    null,
    "Invalid news delete response format",
  );
}

export async function getAdminEvents(): Promise<EventItemResponse[]> {
  return request(
    "/events",
    { method: "GET" },
    isEventListResponse,
    "Invalid events response format",
  );
}

export async function getAdminEventsPaginated(params: {
  page: number;
  limit: number;
}): Promise<PaginatedResponse<EventItemResponse>> {
  const query = buildPaginationQuery(params);
  return request(
    `/events?${query}`,
    { method: "GET" },
    isPaginatedEventListResponse,
    "Invalid paginated events response format",
  );
}

export async function getAdminEventById(id: string): Promise<EventDetailResponse> {
  return request(
    `/events/${id}`,
    { method: "GET" },
    isEventDetailResponse,
    "Invalid event response format",
  );
}

export async function createAdminEvent(formData: FormData): Promise<void> {
  await request(
    "/events",
    { method: "POST", body: formData },
    null,
    "Invalid event create response format",
  );
}

export async function updateAdminEvent(id: string, formData: FormData): Promise<void> {
  await request(
    `/events/${id}`,
    { method: "PUT", body: formData },
    null,
    "Invalid event update response format",
  );
}

export async function deleteAdminEvent(id: string): Promise<void> {
  await request(
    `/events/${id}`,
    { method: "DELETE" },
    null,
    "Invalid event delete response format",
  );
}

export async function getAdminPrograms(): Promise<ProgramItemResponse[]> {
  return request(
    "/programs",
    { method: "GET" },
    isProgramListResponse,
    "Invalid programs response format",
  );
}

export async function getAdminProgramsPaginated(params: {
  page: number;
  limit: number;
}): Promise<PaginatedResponse<ProgramItemResponse>> {
  const query = buildPaginationQuery(params);
  return request(
    `/programs?${query}`,
    { method: "GET" },
    isPaginatedProgramListResponse,
    "Invalid paginated programs response format",
  );
}

export async function getAdminProgramById(id: string): Promise<ProgramDetailResponse> {
  return request(
    `/programs/${id}`,
    { method: "GET" },
    isProgramDetailResponse,
    "Invalid program response format",
  );
}

export async function createAdminProgram(payload: ProgramUpsertPayload): Promise<void> {
  await request(
    "/programs",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    null,
    "Invalid program create response format",
  );
}

export async function updateAdminProgram(
  id: string,
  payload: ProgramUpsertPayload,
): Promise<void> {
  await request(
    `/programs/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    null,
    "Invalid program update response format",
  );
}

export async function deleteAdminProgram(id: string): Promise<void> {
  await request(
    `/programs/${id}`,
    { method: "DELETE" },
    null,
    "Invalid program delete response format",
  );
}

export async function toggleAdminProgramStatus(id: string): Promise<ProgramToggleResponse> {
  return request(
    `/programs/${id}/toggle`,
    { method: "PATCH" },
    isProgramToggleResponse,
    "Invalid program toggle response format",
  );
}

export async function getAdminMembers(): Promise<MemberResponse[]> {
  return request(
    "/members",
    { method: "GET" },
    isMembersResponse,
    "Invalid members response format",
  );
}

export async function getAdminMembersPaginated(params: {
  page: number;
  limit: number;
}): Promise<PaginatedResponse<MemberResponse>> {
  const query = buildPaginationQuery(params);
  return request(
    `/members?${query}`,
    { method: "GET" },
    isPaginatedMemberListResponse,
    "Invalid paginated members response format",
  );
}

export async function getAdminMemberById(id: string): Promise<MemberResponse> {
  return request(
    `/members/${id}`,
    { method: "GET" },
    isMemberResponse,
    "Invalid member response format",
  );
}

export async function createAdminMember(payload: MemberUpsertPayload): Promise<void> {
  await request(
    "/members",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    null,
    "Invalid member create response format",
  );
}

export async function updateAdminMember(
  id: string,
  payload: MemberUpsertPayload,
): Promise<void> {
  await request(
    `/members/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    null,
    "Invalid member update response format",
  );
}

export async function deleteAdminMember(id: string): Promise<void> {
  await request(
    `/members/${id}`,
    { method: "DELETE" },
    null,
    "Invalid member delete response format",
  );
}

export async function uploadAdminImage(file: File): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append("image", file);

  return request(
    "/upload/image",
    { method: "POST", body: formData },
    isUploadImageResponse,
    "Invalid image upload response format",
  );
}

export async function getAdminGalleryAlbums(): Promise<GalleryAlbumResponse[]> {
  return request(
    "/gallery",
    { method: "GET" },
    isGalleryAlbumsResponse,
    "Invalid gallery list response format",
  );
}

export async function getAdminGalleryAlbumsPaginated(params: {
  page: number;
  limit: number;
}): Promise<PaginatedResponse<GalleryAlbumResponse>> {
  const query = buildPaginationQuery(params);
  return request(
    `/gallery?${query}`,
    { method: "GET" },
    isPaginatedGalleryAlbumListResponse,
    "Invalid paginated gallery list response format",
  );
}

export async function createAdminGalleryAlbum(
  formData: FormData,
): Promise<GalleryCreateResponse> {
  return request(
    "/gallery",
    { method: "POST", body: formData },
    isGalleryCreateResponse,
    "Invalid gallery create response format",
  );
}

export async function getAdminGalleryById(id: string): Promise<GalleryDetailResponse> {
  return request(
    `/gallery/${id}`,
    { method: "GET" },
    isGalleryDetailResponse,
    "Invalid gallery response format",
  );
}

export async function deleteAdminGalleryAlbum(id: string): Promise<void> {
  await request(
    `/gallery/${id}`,
    { method: "DELETE" },
    null,
    "Invalid gallery delete response format",
  );
}

export async function toggleAdminGalleryAlbumStatus(
  id: string,
): Promise<GalleryToggleResponse> {
  return request(
    `/gallery/${id}/toggle`,
    { method: "PATCH" },
    isGalleryToggleResponse,
    "Invalid gallery toggle response format",
  );
}

export async function setAdminGalleryCoverImage(
  albumId: string,
  imageId: string,
): Promise<GalleryCoverResponse> {
  return request(
    `/gallery/${albumId}/cover/${imageId}`,
    { method: "PATCH" },
    isGalleryCoverResponse,
    "Invalid gallery cover response format",
  );
}

export async function deleteAdminGalleryImage(imageId: string): Promise<void> {
  await request(
    `/gallery/image/${imageId}`,
    { method: "DELETE" },
    null,
    "Invalid gallery image delete response format",
  );
}

export async function uploadAdminGalleryImages(
  albumId: string,
  files: File[],
): Promise<void> {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  await request(
    `/gallery/${albumId}/images`,
    { method: "POST", body: formData },
    null,
    "Invalid gallery upload response format",
  );
}

export async function getAdminPortfolio(): Promise<PortfolioItemResponse[]> {
  return request(
    "/portfolio",
    { method: "GET" },
    isPortfolioListResponse,
    "Invalid portfolio response format",
  );
}

export async function getAdminPortfolioPaginated(params: {
  page: number;
  limit: number;
}): Promise<PaginatedResponse<PortfolioItemResponse>> {
  const query = buildPaginationQuery(params);
  return request(
    `/portfolio?${query}`,
    { method: "GET" },
    isPaginatedPortfolioListResponse,
    "Invalid paginated portfolio response format",
  );
}

export async function createAdminPortfolioItem(formData: FormData): Promise<void> {
  await request(
    "/portfolio",
    { method: "POST", body: formData },
    null,
    "Invalid portfolio create response format",
  );
}

export async function updateAdminPortfolioItem(
  id: string,
  formData: FormData,
): Promise<void> {
  await request(
    `/portfolio/${id}`,
    { method: "PUT", body: formData },
    null,
    "Invalid portfolio update response format",
  );
}

export async function deleteAdminPortfolioItem(id: string): Promise<void> {
  await request(
    `/portfolio/${id}`,
    { method: "DELETE" },
    null,
    "Invalid portfolio delete response format",
  );
}

export async function toggleAdminPortfolioItemStatus(id: string): Promise<void> {
  await request(
    `/portfolio/${id}/toggle`,
    { method: "PATCH" },
    null,
    "Invalid portfolio toggle response format",
  );
}

export async function getAdminAwards(): Promise<AwardResponse[]> {
  return request(
    "/awards",
    { method: "GET" },
    isAwardsResponse,
    "Invalid awards response format",
  );
}

export async function getAdminAwardsPaginated(params: {
  page: number;
  limit: number;
}): Promise<PaginatedResponse<AwardResponse>> {
  const query = buildPaginationQuery(params);
  return request(
    `/awards?${query}`,
    { method: "GET" },
    isPaginatedAwardListResponse,
    "Invalid paginated awards response format",
  );
}

export async function getAdminAwardById(id: string): Promise<AwardResponse> {
  return request(
    `/awards/${id}`,
    { method: "GET" },
    isAwardResponse,
    "Invalid award response format",
  );
}

export async function createAdminAward(formData: FormData): Promise<void> {
  await request(
    "/awards",
    {
      method: "POST",
      body: formData,
    },
    null,
    "Invalid award create response format",
  );
}

export async function updateAdminAward(
  id: string,
  payload: Partial<AwardUpsertPayload>,
): Promise<void> {
  await request(
    `/awards/${id}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    null,
    "Invalid award update response format",
  );
}

export async function updateAdminAwardWithImage(
  id: string,
  formData: FormData,
): Promise<void> {
  await request(
    `/awards/${id}`,
    {
      method: "PATCH",
      body: formData,
    },
    null,
    "Invalid award update response format",
  );
}

export async function deleteAdminAward(id: string): Promise<void> {
  await request(
    `/awards/${id}`,
    { method: "DELETE" },
    null,
    "Invalid award delete response format",
  );
}
