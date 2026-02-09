import { getTeamMembers } from "@/lib/data/team";

export type TeamOption = {
    value: string;
    label: string;
};

/**
 * Returns active team members formatted for select dropdowns.
 * { value: member_id, label: display_name }
 */
export async function getActiveTeamOptions(): Promise<TeamOption[]> {
    const members = await getTeamMembers(false);
    return members.map((m) => ({
        value: m.member_id,
        label: m.display_name,
    }));
}

/**
 * Resolves a member_id to a display_name from a list of team options.
 */
export function resolveOwnerName(
    memberId: string | null | undefined,
    options: TeamOption[]
): string {
    if (!memberId) return "Unassigned";
    const found = options.find((o) => o.value === memberId);
    return found ? found.label : memberId;
}
