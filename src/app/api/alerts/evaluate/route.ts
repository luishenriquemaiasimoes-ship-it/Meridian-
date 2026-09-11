import { route } from '@/server/http';
import { evaluateAlerts, persistTriggered } from '@/server/services/alerts';

/**
 * Re-evaluates every alert against the current metric set and writes an event +
 * notification for each one that fired. Alerts whose metric is unavailable are
 * returned as such rather than silently passing.
 */
export const POST = route(async (ctx) => {
  const evaluated = await evaluateAlerts(ctx.workspaceId);
  const written = await persistTriggered(ctx.workspaceId, evaluated);
  return {
    evaluated: evaluated.length,
    triggered: evaluated.filter((e) => e.isTriggered).length,
    unavailable: evaluated.filter((e) => !e.dataAvailable).length,
    notificationsWritten: written,
    alerts: evaluated,
  };
}, 'alert:write');
