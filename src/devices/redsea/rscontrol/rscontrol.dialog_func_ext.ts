/**
 * Calibration workflows of the ReefControl probes (EC and pH).
 *
 * Built into the probe_calibration_ec / probe_calibration_ph dialogs by an
 * `extend` view. Each step goes through the integration's
 * `redsea.probe_calibration` service, as the ReefBeat app drives the hub:
 *
 *   enter  -> once, before the first point
 *   point  -> start a point with its solution (LOW / MID / HIGH)
 *   status -> polled until `success` or a `fail_*`: the hub waits for the
 *             reading to settle and reports `time_left` (s) and
 *             `stability_progress` (%) meanwhile, so the next step only
 *             unlocks once it is done
 *   exit   -> at the end, on cancel, or when the dialog is closed
 *
 *   EC: one point (MID), the value of the solution entered in mS/cm.
 *   pH: pH 7 (MID), then pH 10 (HIGH, salt water) or pH 4 (LOW, fresh
 *       water), each with its solution and the temperature it is rated at.
 */

import i18n from "../../../translations/myi18n.js";

/** One calibration solution: its value and the temperature it holds at. */
export interface Solution {
  value: number;
  temp: number;
}

/** pH solutions offered by the ReefBeat app, per point (first = default). */
export const PH_SOLUTIONS: Record<string, Solution[]> = {
  MID: [
    { value: 7.0, temp: 25 },
    { value: 7.01, temp: 25 },
    { value: 7.0, temp: 20 },
    { value: 6.865, temp: 25 },
  ],
  HIGH: [
    { value: 10.0, temp: 25 },
    { value: 10.01, temp: 25 },
    { value: 10.012, temp: 25 },
    { value: 10.0, temp: 20 },
    { value: 9.18, temp: 25 },
  ],
  LOW: [
    { value: 4.0, temp: 25 },
    { value: 4.01, temp: 25 },
    { value: 4.005, temp: 25 },
    { value: 4.0, temp: 20 },
  ],
};

/** EC solution range the hub accepts (mS/cm), as the ReefBeat app checks. */
export const EC_RANGE = { min: 20, max: 99 };

/**
 * Polling of the calibration status, as the ReefBeat app does it
 * (CalibrationInProcessActivity): every 3 s. The wait itself is the hub's:
 * its `time_left` (the app starts its bar at 180 s, 3 min, until the first
 * answer gives the real figure).
 */
export const timing = {
  poll_ms: 3000,
  max_ms: 10 * 60 * 1000,
  sleep: (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms)),
};

/** Id of the wrapper holding the workflow inside #dialog-content. */
const WRAPPER_ID = "probe-calibration";

/** A calibration in progress, kept on its wrapper. */
export interface Session {
  hass: any;
  entry: string | null;
  type: string;
  uid: string;
  entered: boolean;
  wrapper: HTMLElement;
  shadowRoot: any;
}

//----------------------------------------------------------------------------//
//   Hub calls
//----------------------------------------------------------------------------//

/**
 * The probe element behind the element that opened the dialog.
 * @param elt: the element that opened the dialog
 * @return the ControlProbe, or null
 */
export function find_probe(elt: any): any {
  let node = elt;
  while (node) {
    if (node.probe_type && node.probe_uid) return node;
    node = node.device;
  }
  return null;
}

/**
 * Config entry of the hub owning the probe, the service's `device_id`.
 * @param elt: the element that opened the dialog
 * @return the config entry id, or null
 */
export function find_entry(elt: any): string | null {
  let node = elt;
  while (node) {
    const id = node.device?.elements?.[0]?.primary_config_entry;
    if (id) return id;
    node = node.device;
  }
  return null;
}

/**
 * Run one calibration step on the hub.
 * @param session: the calibration
 * @param action: enter, point, status or exit
 * @param extra: the step's other fields
 * @return the service response, null when the call failed
 */
export async function call(
  session: Session,
  action: string,
  extra: Record<string, any> = {},
): Promise<any> {
  try {
    const answer = await session.hass.callWS({
      type: "call_service",
      domain: "redsea",
      service: "probe_calibration",
      service_data: {
        device_id: session.entry,
        probe_type: session.type,
        probe_uid: session.uid,
        action,
        ...extra,
      },
      return_response: true,
    });
    return answer?.response ?? null;
  } catch (err) {
    console.warn(`Calibration ${action} failed`, err);
    return null;
  }
}

/**
 * Whether the dialog of a calibration is still open.
 * @param session: the calibration
 * @return false once the dialog was closed or replaced
 */
export function is_open(session: Session): boolean {
  if (!session.wrapper.isConnected) return false;
  const mask = session.shadowRoot?.querySelector?.("#window-mask");
  return !mask || mask.style.display !== "none";
}

/**
 * Leave calibration mode, when entered.
 * @param session: the calibration
 */
export async function leave(session: Session): Promise<void> {
  if (!session.entered) return;
  session.entered = false;
  await call(session, "exit");
}

/**
 * Calibrate one point: enter calibration if needed, start the point, then
 * follow its status until the hub is done with it.
 * @param session: the calibration
 * @param point: LOW, MID or HIGH
 * @param value: the value of the solution
 * @param temp: the temperature the solution is rated at (pH only)
 * @return the final status: success, a fail_* or cancelled
 */
export async function run_point(
  session: Session,
  point: string,
  value: number,
  temp?: number,
): Promise<string> {
  if (!session.entered) {
    const entered = await call(session, "enter");
    if (!entered?.ok) return "fail_process";
    session.entered = true;
  }
  const extra: Record<string, any> = { point, solution_value: value };
  if (temp !== undefined) extra.solution_rated_temp = temp;
  const started = await call(session, "point", extra);
  if (!started?.ok) return "fail_process";

  const since = Date.now();
  for (;;) {
    await timing.sleep(timing.poll_ms);
    if (!is_open(session)) {
      await leave(session);
      return "cancelled";
    }
    const answer = await call(session, "status");
    const status = answer?.json ?? {};
    const state = status.calibration_status;
    if (state === "success" || String(state).startsWith("fail")) {
      return state;
    }
    show_progress(session, status);
    if (Date.now() - since > timing.max_ms) return "fail_process";
  }
}

//----------------------------------------------------------------------------//
//   Rendering
//----------------------------------------------------------------------------//

/**
 * Text telling how a calibration ended.
 * @param state: the final status
 * @return the message
 */
export function result_text(state: string): string {
  switch (state) {
    case "success":
      return i18n._("calibration_success");
    case "fail_stability":
      return i18n._("calibration_fail_stability");
    case "fail_check_solution":
      return i18n._("calibration_fail_check_solution");
    case "fail_value_error":
      return i18n._("calibration_fail_value");
    default:
      return i18n._("calibration_fail");
  }
}

/**
 * Show where the hub is with the point: stability and time left.
 * @param session: the calibration
 * @param status: the calibration status
 */
export function show_progress(session: Session, status: any): void {
  const progress = Number.parseFloat(status?.stability_progress);
  const left = Number(status?.time_left);
  const bar = session.wrapper.querySelector(
    "progress",
  ) as HTMLProgressElement | null;
  if (bar) bar.value = Number.isFinite(progress) ? progress : 0;
  set_message(
    session,
    i18n._("calibration_progress", {
      progress: Number.isFinite(progress) ? Math.round(progress) : 0,
      time: Number.isFinite(left) ? Math.max(0, Math.round(left)) : "?",
    }),
  );
}

/**
 * Show a message under the controls.
 * @param session: the calibration
 * @param text: the message
 * @param state: "error", "success" or "" (neutral)
 */
export function set_message(
  session: Session,
  text: string,
  state: string = "",
): void {
  const box = session.wrapper.querySelector(".calibration_message");
  if (!box) return;
  box.textContent = text;
  (box as HTMLElement).dataset.state = state;
  (box as HTMLElement).style.color =
    state === "error"
      ? "var(--error-color, #db4437)"
      : state === "success"
        ? "var(--success-color, #43a047)"
        : "";
}

/**
 * Label of a pH solution, e.g. "7.01 (25 °C)".
 * @param solution: the solution
 * @return the label
 */
export function solution_label(solution: Solution): string {
  return `${solution.value} (${solution.temp} °C)`;
}

/**
 * Create an element with a class and children.
 * @param tag: the tag name
 * @param attrs: properties to set
 * @param children: elements or text to append
 * @return the element
 */
function make(
  tag: string,
  attrs: Record<string, any> = {},
  children: (Node | string)[] = [],
): any {
  const node: any = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) node[key] = value;
  for (const child of children) node.append(child);
  return node;
}

/**
 * A button of the workflow.
 * @param id: its id
 * @param label: its text
 * @param onclick: what it does
 * @return the button
 */
function button(id: string, label: string, onclick: () => void): any {
  const node = make("button", { id, textContent: label });
  node.style.margin = "8px 4px";
  node.addEventListener("click", onclick);
  return node;
}

/**
 * A select listing the solutions of a pH point.
 * @param id: its id
 * @param point: LOW, MID or HIGH
 * @return the select
 */
function solution_select(id: string, point: string): any {
  const select = make("select", { id });
  PH_SOLUTIONS[point]!.forEach((solution, index) => {
    select.append(
      make("option", {
        value: String(index),
        textContent: solution_label(solution),
      }),
    );
  });
  return select;
}

/**
 * Open (or refresh) the workflow of a dialog: build it once, then only
 * hand it the fresh hass on every update.
 * @param elt: the element that opened the dialog
 * @param hass: the current Home Assistant object
 * @param shadowRoot: the dialog shadow root
 * @param build: fills the wrapper of a new session
 * @return the session, null when the dialog cannot host one
 */
function open_session(
  elt: any,
  hass: any,
  shadowRoot: any,
  build: (session: Session) => void,
): Session | null {
  const container = shadowRoot?.querySelector("#dialog-content");
  const probe = find_probe(elt);
  if (!container || !probe) return null;
  const previous = shadowRoot.querySelector("#" + WRAPPER_ID);
  if (previous?._session) {
    previous._session.hass = hass;
    return previous._session;
  }
  const wrapper = make("div", { id: WRAPPER_ID });
  wrapper.style.textAlign = "center";
  const session: Session = {
    hass,
    entry: find_entry(elt),
    type: probe.probe_type,
    uid: probe.probe_uid,
    entered: false,
    wrapper,
    shadowRoot,
  };
  wrapper._session = session;
  build(session);
  wrapper.append(
    make("progress", { max: 100, value: 0 }),
    make("div", { className: "calibration_message" }),
  );
  container.appendChild(wrapper);
  return session;
}

/**
 * Read the EC solution value typed in.
 * @param raw: the text of the field
 * @return the value, or null when out of range or over one decimal
 */
export function parse_ec_value(raw: string): number | null {
  const text = String(raw ?? "")
    .trim()
    .replace(",", ".");
  if (!/^\d{1,2}(\.\d)?$/.test(text)) return null;
  const value = Number.parseFloat(text);
  return value >= EC_RANGE.min && value <= EC_RANGE.max ? value : null;
}

//----------------------------------------------------------------------------//
//   Dialogs
//----------------------------------------------------------------------------//

/**
 * EC calibration: the value of the solution, then one point.
 * @param elt: the element that opened the dialog
 * @param hass: the current Home Assistant object
 * @param shadowRoot: the dialog shadow root
 */
export function probe_calibration_ec(
  elt: any,
  hass: any,
  shadowRoot: any,
): void {
  open_session(elt, hass, shadowRoot, (session) => {
    const input = make("input", {
      id: "calibration_ec_value",
      type: "text",
      inputMode: "decimal",
      placeholder: "53.1",
    });
    input.style.width = "6em";
    const validate = button(
      "calibration_ec_validate",
      i18n._("calibration_validate"),
      async () => {
        const value = parse_ec_value(input.value);
        if (value === null) {
          set_message(session, i18n._("calibration_ec_range"), "error");
          return;
        }
        input.disabled = validate.disabled = true;
        set_message(session, i18n._("calibration_running"));
        const state = await run_point(session, "MID", value);
        if (state === "cancelled") return;
        await leave(session);
        set_message(
          session,
          result_text(state),
          state === "success" ? "success" : "error",
        );
        input.disabled = validate.disabled = false;
      },
    );
    session.wrapper.append(
      make("label", { htmlFor: "calibration_ec_value" }, [
        i18n._("calibration_ec_value") + " ",
      ]),
      input,
      make("br"),
      validate,
    );
  });
}

/**
 * pH calibration: pH 7, then pH 10 (salt water) or pH 4 (fresh water).
 * @param elt: the element that opened the dialog
 * @param hass: the current Home Assistant object
 * @param shadowRoot: the dialog shadow root
 */
export function probe_calibration_ph(
  elt: any,
  hass: any,
  shadowRoot: any,
): void {
  open_session(elt, hass, shadowRoot, (session) => {
    const wrapper = session.wrapper;

    // Step 1: pH 7
    const step1 = make("div", { id: "calibration_ph_step1" });
    const mid = solution_select("calibration_ph_mid", "MID");
    const start1 = button(
      "calibration_ph_start1",
      i18n._("calibration_start"),
      () =>
        run_step(start1, "MID", mid, () => {
          step1.hidden = true;
          step2.hidden = false;
          set_message(session, i18n._("calibration_ph_rinse"));
        }),
    );
    step1.append(
      make("p", { textContent: i18n._("calibration_ph_step1") }),
      mid,
      make("br"),
      start1,
    );

    // Step 2: pH 10 or pH 4
    const step2 = make("div", { id: "calibration_ph_step2", hidden: true });
    const second = make("select", { id: "calibration_ph_point" });
    second.append(
      make("option", {
        value: "HIGH",
        textContent: i18n._("calibration_ph_high"),
      }),
      make("option", {
        value: "LOW",
        textContent: i18n._("calibration_ph_low"),
      }),
    );
    let solutions = solution_select("calibration_ph_second", "HIGH");
    second.addEventListener("change", () => {
      const fresh = solution_select("calibration_ph_second", second.value);
      solutions.replaceWith(fresh);
      solutions = fresh;
    });
    const start2 = button(
      "calibration_ph_start2",
      i18n._("calibration_start"),
      () =>
        run_step(start2, second.value, solutions, async () => {
          await leave(session);
          step2.hidden = true;
          set_message(session, i18n._("calibration_success"), "success");
        }),
    );
    // One point is enough when the second solution is missing
    const finish = button(
      "calibration_ph_finish",
      i18n._("finish"),
      async () => {
        await leave(session);
        step2.hidden = true;
        set_message(session, i18n._("calibration_success"), "success");
      },
    );
    step2.append(
      make("p", { textContent: i18n._("calibration_ph_step2") }),
      second,
      make("br"),
      solutions,
      make("br"),
      start2,
      finish,
    );
    wrapper.append(step1, step2);

    /**
     * Calibrate a point with the solution selected, then move on.
     * @param trigger: the button started from, disabled meanwhile
     * @param point: LOW, MID or HIGH
     * @param select: the select holding the solution
     * @param next: what to do once the point succeeded
     */
    async function run_step(
      trigger: any,
      point: string,
      select: any,
      next: () => void | Promise<void>,
    ): Promise<void> {
      const solution = PH_SOLUTIONS[point]![Number(select.value)]!;
      trigger.disabled = true;
      set_message(session, i18n._("calibration_running"));
      const state = await run_point(
        session,
        point,
        solution.value,
        solution.temp,
      );
      trigger.disabled = false;
      if (state === "cancelled") return;
      if (state === "success") {
        await next();
        return;
      }
      // The point can be started again
      set_message(session, result_text(state), "error");
    }
  });
}
