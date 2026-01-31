export type AccessibilityRequirement =
  | 'keyboard'
  | 'focusRing'
  | 'hitTarget'
  | 'stateIndicator';

export type StateIndicator = 'color' | 'label' | 'icon' | 'aria' | 'pattern';

export interface KeyboardAction {
  key: string;
  description: string;
}

export interface HitTarget {
  width: number;
  height: number;
}

export interface InteractiveControl {
  id: string;
  label: string;
  keyboardAction: KeyboardAction | null;
  focusRingVisible: boolean;
  hitTarget: HitTarget;
  stateIndicators: StateIndicator[];
}

export interface AccessibilityViolation {
  controlId: string;
  requirement: AccessibilityRequirement;
  message: string;
}

const MIN_HIT_TARGET_PX = 40;

function hasKeyboardAccess(control: InteractiveControl): boolean {
  if (!control.keyboardAction) {
    return false;
  }
  return control.keyboardAction.key.trim().length > 0;
}

function hasVisibleFocusRing(control: InteractiveControl): boolean {
  return control.focusRingVisible;
}

function meetsHitTarget(control: InteractiveControl): boolean {
  return (
    control.hitTarget.width >= MIN_HIT_TARGET_PX && control.hitTarget.height >= MIN_HIT_TARGET_PX
  );
}

function usesMultipleStateIndicators(control: InteractiveControl): boolean {
  return control.stateIndicators.some((indicator) => indicator !== 'color');
}

function auditControl(control: InteractiveControl): AccessibilityViolation[] {
  const violations: AccessibilityViolation[] = [];

  if (!hasKeyboardAccess(control)) {
    violations.push({
      controlId: control.id,
      requirement: 'keyboard',
      message: `${control.label} requires a keyboard activation per spec 0010`,
    });
  }

  if (!hasVisibleFocusRing(control)) {
    violations.push({
      controlId: control.id,
      requirement: 'focusRing',
      message: `${control.label} must keep its focus ring visible for keyboard users`,
    });
  }

  if (!meetsHitTarget(control)) {
    violations.push({
      controlId: control.id,
      requirement: 'hitTarget',
      message: `${control.label} needs a ${MIN_HIT_TARGET_PX}px hit target`,
    });
  }

  if (!usesMultipleStateIndicators(control)) {
    violations.push({
      controlId: control.id,
      requirement: 'stateIndicator',
      message: `${control.label} cannot rely solely on color to communicate state`,
    });
  }

  return violations;
}

export function auditAccessibility(controls: readonly InteractiveControl[]): AccessibilityViolation[] {
  return controls.flatMap((control) => auditControl(control));
}

export function isControlCompliant(control: InteractiveControl): boolean {
  return auditControl(control).length === 0;
}

export function getHitTargetMinimum(): number {
  return MIN_HIT_TARGET_PX;
}
