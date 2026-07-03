import { useProfiles } from "@/features/profile";

/**
 * Backward compatibility.
 * Semua halaman admin masih memakai useUsers().
 * Sebenarnya sekarang data berasal dari Profile Service.
 */
export const useUsers = useProfiles;