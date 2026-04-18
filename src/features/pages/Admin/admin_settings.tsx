import {
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";
import { Activity, MapPinned, RadioTower, Route, Save, Zap } from "lucide-react";
import { adminService } from "./services/adminService";
import { routesService } from "./services/routesService";
import { stopsService } from "./services/stopsService";
import type {
  SystemMaintenanceSettings,
  SystemMaintenanceSettingsInput,
} from "@/features/types/operations";

const DEFAULT_SETTINGS: SystemMaintenanceSettings = {
  driver_tracking_distance_meters: 15,
  driver_tracking_interval_seconds: 10,
  off_route_alert_cooldown_seconds: 180,
  off_route_threshold_meters: 250,
  mapbox_enabled: true,
  mapbox_circuit_breaker_limit: 80000,
  mapbox_segment_cache_ttl_seconds: 300,
  mapbox_calls_this_month: 0,
  mapbox_calls_month_key: "",
  updated_at: new Date(0).toISOString(),
  updated_by_name: null,
  updated_by_user_id: null,
};

type RouteSegmentInfo = {
  routeName: string;
  segments: number;
};

function formatRelativeDetails(settings: SystemMaintenanceSettings) {
  const updatedAt = settings.updated_at
    ? new Date(settings.updated_at)
    : null;

  if (!updatedAt || Number.isNaN(updatedAt.getTime())) {
    return "Using default system maintenance values.";
  }

  const dateLabel = updatedAt.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

  if (settings.updated_by_name) {
    return `Last updated on ${dateLabel} by ${settings.updated_by_name}.`;
  }

  return `Last updated on ${dateLabel}.`;
}

function computeEstimatedCalls(totalSegments: number, ttlSeconds: number): number {
  const refreshesPerDay = 28800 / Math.max(1, ttlSeconds);
  return Math.round(totalSegments * refreshesPerDay * 30);
}

export function AdminSystemSettings() {
  const [settings, setSettings] = useState<SystemMaintenanceSettings>(DEFAULT_SETTINGS);
  const [form, setForm] = useState<SystemMaintenanceSettingsInput>({
    driver_tracking_distance_meters: DEFAULT_SETTINGS.driver_tracking_distance_meters,
    driver_tracking_interval_seconds: DEFAULT_SETTINGS.driver_tracking_interval_seconds,
    off_route_alert_cooldown_seconds: DEFAULT_SETTINGS.off_route_alert_cooldown_seconds,
    off_route_threshold_meters: DEFAULT_SETTINGS.off_route_threshold_meters,
    mapbox_enabled: DEFAULT_SETTINGS.mapbox_enabled,
    mapbox_circuit_breaker_limit: DEFAULT_SETTINGS.mapbox_circuit_breaker_limit,
    mapbox_segment_cache_ttl_seconds: DEFAULT_SETTINGS.mapbox_segment_cache_ttl_seconds,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [routeSegments, setRouteSegments] = useState<RouteSegmentInfo[]>([]);
  const [feedback, setFeedback] = useState<{
    message: string;
    tone: "error" | "success";
  } | null>(null);

  const loadSettings = useEffectEvent(async () => {
    setIsLoading(true);

    try {
      const [data, routes] = await Promise.all([
        adminService.getMaintenanceSettings(),
        routesService.getRoutes(),
      ]);
      const resolved = data ?? DEFAULT_SETTINGS;

      setSettings(resolved);
      setForm({
        driver_tracking_distance_meters: resolved.driver_tracking_distance_meters,
        driver_tracking_interval_seconds: resolved.driver_tracking_interval_seconds,
        off_route_alert_cooldown_seconds: resolved.off_route_alert_cooldown_seconds,
        off_route_threshold_meters: resolved.off_route_threshold_meters,
        mapbox_enabled: resolved.mapbox_enabled,
        mapbox_circuit_breaker_limit: resolved.mapbox_circuit_breaker_limit,
        mapbox_segment_cache_ttl_seconds: resolved.mapbox_segment_cache_ttl_seconds,
      });
      setFeedback(null);

      // Fetch stop counts for cost preview — only active routes generate Mapbox calls
      const activeRoutes = routes.filter((r) => r.is_active);
      const stopsByRoute = await Promise.all(
        activeRoutes.map((r) =>
          stopsService.getStopsByRoute(r.id).then((stops) => ({
            routeName: r.route_name,
            segments: Math.max(0, stops.length - 1),
          })).catch(() => ({ routeName: r.route_name, segments: 0 })),
        ),
      );
      setRouteSegments(stopsByRoute.filter((r) => r.segments > 0));
    } catch (error) {
      console.error("Failed to load maintenance settings", error);
      setFeedback({
        message: "Maintenance settings could not be loaded right now.",
        tone: "error",
      });
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    void loadSettings();
  }, []);

  const isDirty = useMemo(() => {
    return (
      form.driver_tracking_distance_meters !== settings.driver_tracking_distance_meters ||
      form.driver_tracking_interval_seconds !== settings.driver_tracking_interval_seconds ||
      form.off_route_alert_cooldown_seconds !== settings.off_route_alert_cooldown_seconds ||
      form.off_route_threshold_meters !== settings.off_route_threshold_meters ||
      form.mapbox_enabled !== settings.mapbox_enabled ||
      form.mapbox_circuit_breaker_limit !== settings.mapbox_circuit_breaker_limit ||
      form.mapbox_segment_cache_ttl_seconds !== settings.mapbox_segment_cache_ttl_seconds
    );
  }, [form, settings]);

  const isMapboxDirty = useMemo(() => {
    return (
      form.mapbox_enabled !== settings.mapbox_enabled ||
      form.mapbox_circuit_breaker_limit !== settings.mapbox_circuit_breaker_limit ||
      form.mapbox_segment_cache_ttl_seconds !== settings.mapbox_segment_cache_ttl_seconds
    );
  }, [form, settings]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isMapboxDirty) {
      const confirmed = window.confirm(
        "You are changing Mapbox ETA settings.\n\n" +
        "Incorrect values may increase API costs or reduce ETA accuracy.\n\n" +
        "Do you want to save these changes?",
      );
      if (!confirmed) return;
    }

    setIsSaving(true);

    try {
      const updated = await adminService.updateMaintenanceSettings(form);
      setSettings(updated);
      setForm({
        driver_tracking_distance_meters: updated.driver_tracking_distance_meters,
        driver_tracking_interval_seconds: updated.driver_tracking_interval_seconds,
        off_route_alert_cooldown_seconds: updated.off_route_alert_cooldown_seconds,
        off_route_threshold_meters: updated.off_route_threshold_meters,
        mapbox_enabled: updated.mapbox_enabled,
        mapbox_circuit_breaker_limit: updated.mapbox_circuit_breaker_limit,
        mapbox_segment_cache_ttl_seconds: updated.mapbox_segment_cache_ttl_seconds,
      });
      setFeedback({
        message: "System maintenance settings were saved successfully.",
        tone: "success",
      });
    } catch (error) {
      console.error("Failed to save maintenance settings", error);
      setFeedback({
        message: "Settings could not be saved. Check the values and try again.",
        tone: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  function updateNumberField(
    field: keyof SystemMaintenanceSettingsInput,
    value: string,
  ) {
    const nextValue = Number.parseInt(value, 10);

    setForm((current) => ({
      ...current,
      [field]: Number.isFinite(nextValue) ? nextValue : 0,
    }));
  }

  const totalSegments = routeSegments.reduce((sum, r) => sum + r.segments, 0);
  const estimatedCalls = computeEstimatedCalls(
    totalSegments,
    form.mapbox_segment_cache_ttl_seconds ?? 300,
  );
  const circuitBreaker = form.mapbox_circuit_breaker_limit ?? 80000;
  const callsUsageRatio = circuitBreaker > 0 ? estimatedCalls / circuitBreaker : 0;

  const ttl = form.mapbox_segment_cache_ttl_seconds ?? 300;
  const ttlWarning = ttl < 120
    ? `⚠️ Cache TTL below 2 minutes will significantly increase API calls. At ${ttl}s TTL with ${totalSegments} active segments, estimated usage is ~${estimatedCalls.toLocaleString()} calls/month.`
    : null;
  const circuitBreakerWarning = circuitBreaker > 90000
    ? "⚠️ Setting this above 90,000 leaves little buffer before the 100,000 free-tier limit. Consider upgrading your Mapbox plan first."
    : null;
  const mapboxDisabledWarning = form.mapbox_enabled === false
    ? "ETA will revert to straight-line distance estimation. This is less accurate but costs nothing."
    : null;

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700/60">
              System Maintenance
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Tracking & Geofence Controls
            </h1>
            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Tune how often driver devices send GPS updates and how far a vehicle can drift from its
              route before the operations team gets an alert.
            </p>
          </div>

          <div className="rounded-[24px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <p className="font-medium">Operational note</p>
            <p className="mt-1 text-emerald-800/80">
              Off-route checks use the ordered route stops as the baseline path. Changes apply to new or
              restarted mobile tracking sessions.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <SummaryCard
            accentClass="bg-sky-100 text-sky-700"
            icon={<RadioTower size={18} />}
            label="GPS cadence"
            note="Current push interval"
            value={`${settings.driver_tracking_interval_seconds}s`}
          />
          <SummaryCard
            accentClass="bg-amber-100 text-amber-700"
            icon={<MapPinned size={18} />}
            label="Movement gate"
            note="Minimum movement before sync"
            value={`${settings.driver_tracking_distance_meters}m`}
          />
          <SummaryCard
            accentClass="bg-rose-100 text-rose-700"
            icon={<Route size={18} />}
            label="Off-route threshold"
            note="Alert trigger distance"
            value={`${settings.off_route_threshold_meters}m`}
          />
        </div>
      </section>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-slate-900">Driver Tracking Cadence</h2>
              <p className="text-sm text-slate-500">
                Control how aggressively driver devices upload location data while a trip is in progress.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SettingField
                description="How often the mobile app sends a fresh GPS sample during an active trip."
                inputProps={{
                  max: 60,
                  min: 5,
                  onChange: (event) => updateNumberField("driver_tracking_interval_seconds", event.target.value),
                  value: form.driver_tracking_interval_seconds,
                }}
                label="Tracking Frequency"
                suffix="seconds"
              />
              <SettingField
                description="Prevents noisy uploads when a vehicle has barely moved."
                inputProps={{
                  max: 100,
                  min: 5,
                  onChange: (event) => updateNumberField("driver_tracking_distance_meters", event.target.value),
                  value: form.driver_tracking_distance_meters,
                }}
                label="Distance Interval"
                suffix="meters"
              />
            </div>
          </section>

          <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-semibold text-slate-900">Off-Route Alert Thresholds</h2>
              <p className="text-sm text-slate-500">
                Define when the system should consider a jeepney off-route and how often repeat alerts can be sent.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4">
              <SettingField
                description="If the live vehicle location exceeds this distance from the route path, staff and admins receive a warning."
                inputProps={{
                  max: 1000,
                  min: 25,
                  onChange: (event) => updateNumberField("off_route_threshold_meters", event.target.value),
                  value: form.off_route_threshold_meters,
                }}
                label="Off-Route Threshold"
                suffix="meters"
              />
              <SettingField
                description="Limits repeat warnings for the same ongoing deviation so the alert feed stays usable."
                inputProps={{
                  max: 3600,
                  min: 30,
                  onChange: (event) => updateNumberField("off_route_alert_cooldown_seconds", event.target.value),
                  value: form.off_route_alert_cooldown_seconds,
                }}
                label="Alert Cooldown"
                suffix="seconds"
              />
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Audit Trail
              </p>
              <p className="mt-2 text-sm text-slate-600">{formatRelativeDetails(settings)}</p>
            </div>
          </section>
        </div>

        {/* Mapbox ETA Settings */}
        <section className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="rounded-2xl bg-violet-100 p-2 text-violet-700">
                  <Zap size={16} />
                </div>
                <h2 className="text-base font-semibold text-slate-900">Mapbox ETA Settings</h2>
              </div>
              <p className="text-sm text-slate-500">
                Controls road-aware ETA calculation via Mapbox Directions API. Changing these values affects
                API usage costs. A circuit breaker automatically disables Mapbox for the rest of the month
                if the call limit is reached — haversine estimation takes over seamlessly.
              </p>
            </div>

            {/* Master toggle */}
            <div className="mt-3 sm:mt-0 sm:ml-6 sm:shrink-0">
              <label className="flex cursor-pointer items-center gap-3">
                <span className="text-sm font-medium text-slate-700">Mapbox ETA</span>
                <button
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 ${
                    form.mapbox_enabled ? "bg-violet-600" : "bg-slate-200"
                  }`}
                  onClick={() => setForm((f) => ({ ...f, mapbox_enabled: !f.mapbox_enabled }))}
                  role="switch"
                  aria-checked={form.mapbox_enabled}
                  type="button"
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      form.mapbox_enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className={`text-sm ${form.mapbox_enabled ? "text-violet-700 font-medium" : "text-slate-400"}`}>
                  {form.mapbox_enabled ? "On" : "Off"}
                </span>
              </label>
            </div>
          </div>

          {mapboxDisabledWarning && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {mapboxDisabledWarning}
            </div>
          )}

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SettingField
              description="Max API calls per month before Mapbox auto-disables. Resets on the 1st of each month."
              inputProps={{
                max: 100000,
                min: 1000,
                onChange: (event) => updateNumberField("mapbox_circuit_breaker_limit", event.target.value),
                value: form.mapbox_circuit_breaker_limit ?? 80000,
              }}
              label="Circuit Breaker Limit"
              suffix="calls/mo"
            />
            <SettingField
              description="How long a cached road segment stays valid before Mapbox is called again for that leg."
              inputProps={{
                max: 3600,
                min: 60,
                onChange: (event) => updateNumberField("mapbox_segment_cache_ttl_seconds", event.target.value),
                value: form.mapbox_segment_cache_ttl_seconds ?? 300,
              }}
              label="Segment Cache TTL"
              suffix="seconds"
            />

            {/* Read-only usage display */}
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-slate-400" />
                <span className="text-sm font-semibold text-slate-900">Calls This Month</span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-900">
                {settings.mapbox_calls_this_month.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                of {settings.mapbox_circuit_breaker_limit.toLocaleString()} limit
              </p>
              {settings.mapbox_calls_month_key && (
                <p className="mt-1 text-xs text-slate-400">
                  Resets on 1 {new Date(settings.mapbox_calls_month_key + "-01").toLocaleString(undefined, { month: "long", year: "numeric" }).replace(/\d+\s/, "")}
                </p>
              )}
            </div>
          </div>

          {ttlWarning && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {ttlWarning}
            </div>
          )}
          {circuitBreakerWarning && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {circuitBreakerWarning}
            </div>
          )}

          {/* Live cost preview */}
          {totalSegments > 0 && (
            <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Estimated API Usage Preview
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Based on {totalSegments} active route segments across {routeSegments.length} route{routeSegments.length !== 1 ? "s" : ""}.
                At a {form.mapbox_segment_cache_ttl_seconds ?? 300}s cache TTL:
              </p>
              <div className="mt-3 space-y-1">
                {routeSegments.map((r) => (
                  <div key={r.routeName} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{r.routeName}</span>
                    <span className="font-medium text-slate-700">
                      {r.segments} segment{r.segments !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-900">
                  ~{estimatedCalls.toLocaleString()} calls/month
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    callsUsageRatio > 0.8
                      ? "bg-rose-100 text-rose-700"
                      : callsUsageRatio > 0.6
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {Math.round(callsUsageRatio * 100)}% of limit
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Feedback + Save/Reset */}
        {feedback && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              feedback.tone === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            onClick={() => {
              setForm({
                driver_tracking_distance_meters: settings.driver_tracking_distance_meters,
                driver_tracking_interval_seconds: settings.driver_tracking_interval_seconds,
                off_route_alert_cooldown_seconds: settings.off_route_alert_cooldown_seconds,
                off_route_threshold_meters: settings.off_route_threshold_meters,
                mapbox_enabled: settings.mapbox_enabled,
                mapbox_circuit_breaker_limit: settings.mapbox_circuit_breaker_limit,
                mapbox_segment_cache_ttl_seconds: settings.mapbox_segment_cache_ttl_seconds,
              });
              setFeedback(null);
            }}
            type="button"
          >
            Reset Changes
          </button>

          <button
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300"
            disabled={!isDirty || isLoading || isSaving}
            type="submit"
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      {isLoading && (
        <section className="rounded-[24px] border border-dashed border-slate-300 bg-white/70 px-4 py-5 text-sm text-slate-500">
          Loading the latest maintenance configuration...
        </section>
      )}
    </div>
  );
}

type SettingFieldProps = {
  description: string;
  inputProps: {
    max: number;
    min: number;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    value: number;
  };
  label: string;
  suffix: string;
};

function SettingField({
  description,
  inputProps,
  label,
  suffix,
}: SettingFieldProps) {
  return (
    <label className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <span className="mt-1 block text-sm text-slate-500">{description}</span>

      <div className="mt-4 flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <input
          className="w-full bg-transparent text-base font-medium text-slate-900 outline-none"
          type="number"
          {...inputProps}
        />
        <span className="text-sm font-medium text-slate-400">{suffix}</span>
      </div>
    </label>
  );
}

type SummaryCardProps = {
  accentClass: string;
  icon: ReactNode;
  label: string;
  note: string;
  value: string;
};

function SummaryCard({
  accentClass,
  icon,
  label,
  note,
  value,
}: SummaryCardProps) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
          <p className="mt-1 text-sm text-slate-500">{note}</p>
        </div>

        <div className={`rounded-2xl p-3 ${accentClass}`}>
          {icon}
        </div>
      </div>
    </article>
  );
}
