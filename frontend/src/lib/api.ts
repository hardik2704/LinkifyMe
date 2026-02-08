/**
 * API Client for LinkifyMe Backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ============================================================================
// Types
// ============================================================================

export interface UserInfo {
    user_id: string;
    linkedin_url: string;
    email: string;
    phone?: string;
    name?: string;
    total_attempts: number;
    last_attempt_at?: string;
    created_at?: string;
}

export interface AttemptSummary {
    attempt_id: string;
    customer_id: string;
    final_score: number;
    timestamp: string;
    linkedin_url: string;
    first_name?: string;
    status?: string;
}

export interface UserLookupResponse {
    found: boolean;
    user: UserInfo | null;
    message: string;
}

export interface UserAttemptsResponse {
    user: UserInfo;
    attempts: AttemptSummary[];
}

export interface ScoreComparison {
    section: string;
    current_score: number;
    previous_score: number;
    delta: number;
    change_direction: "improved" | "declined" | "unchanged";
}

export interface ComparisonResponse {
    current_attempt: AttemptSummary;
    previous_attempt: AttemptSummary;
    overall_delta: number;
    sections: ScoreComparison[];
    summary: string;
}

export interface IntakeRequest {
    linkedin_url: string;
    email: string;
    phone?: string;
    target_group: string;
}

export interface IntakeResponse {
    unique_id: string;
    user_id?: string;
    is_returning_user: boolean;
    previous_attempts_count: number;
    message: string;
    status: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Look up a user by LinkedIn URL or email
 */
export async function lookupUser(
    linkedinUrl?: string,
    email?: string
): Promise<UserLookupResponse> {
    const params = new URLSearchParams();
    if (linkedinUrl) params.set("linkedin_url", linkedinUrl);
    if (email) params.set("email", email);

    const response = await fetch(`${API_BASE}/api/user/lookup?${params}`);
    if (!response.ok) {
        throw new Error("Failed to lookup user");
    }
    return response.json();
}

/**
 * Get user's attempt history
 */
export async function getUserAttempts(
    userId: string
): Promise<UserAttemptsResponse> {
    const response = await fetch(`${API_BASE}/api/user/${userId}/attempts`);
    if (!response.ok) {
        throw new Error("Failed to get user attempts");
    }
    return response.json();
}

/**
 * Compare two attempts
 */
export async function compareAttempts(
    currentAttemptId: string,
    previousAttemptId: string
): Promise<ComparisonResponse> {
    const response = await fetch(
        `${API_BASE}/api/comparison/${currentAttemptId}/${previousAttemptId}`
    );
    if (!response.ok) {
        throw new Error("Failed to compare attempts");
    }
    return response.json();
}

/**
 * Submit intake form to start analysis
 */
export async function submitIntake(
    data: IntakeRequest
): Promise<IntakeResponse> {
    const response = await fetch(`${API_BASE}/api/intake`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || "Failed to submit intake");
    }

    return response.json();
}
