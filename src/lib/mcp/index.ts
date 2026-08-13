import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getHunterStatus from "./tools/get-hunter-status";
import getDailyQuests from "./tools/get-daily-quests";
import getDungeonProfile from "./tools/get-dungeon-profile";
import getInventory from "./tools/get-inventory";
import getLeaderboard from "./tools/get-leaderboard";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "s-rank-level-system",
  title: "S-RANK LEVEL SYSTEM",
  version: "0.1.0",
  instructions:
    "Tools for the S-RANK LEVEL SYSTEM hunter app. Read the signed-in hunter's level and stats, today's daily quests, dungeon profile, inventory, and the public hunter ranking.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getHunterStatus, getDailyQuests, getDungeonProfile, getInventory, getLeaderboard],
});
