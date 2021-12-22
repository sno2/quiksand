export const enum PseudoClassType {
  Dir,
  Lang,
  AnyLink,
  Link,
  Visited,
  LocalLink,
  Target,
  TargetWithin,
  Scope,
  Hover,
  Active,
  Focus,
  FocusVisible,
  FocusWithin,
  Current,
  Past,
  Future,
  Playing,
  Paused,
  Seeking,
  Buffering,
  Stalled,
  Muted,
  VolumeLocked,
  Enabled,
  Disabled,
  ReadOnly,
  ReadWrite,
  PlaceholderShown,
  Default,
  Checked,
  Indeterminate,
  Blank,
  Valid,
  Invalid,
  InRange,
  OutOfRange,
  Required,
  Optional,
  UserValid,
  UserInvalid,
  Root,
  Empty,
  NthChild,
  NthLastChild,
  FirstChild,
  LastChild,
  OnlyChild,
  NthOfType,
  NthLastOfType,
  FirstOfType,
  LastOfType,
  OnlyOfType,
}

export const enum Dir {
  Rtl,
  Ltr,
}

export function parsePseudoClassType(name: string): PseudoClassType | null {
  switch (name) {
    case "dir":
      return PseudoClassType.Dir;
    case "lang":
      return PseudoClassType.Lang;
    case "any-link":
      return PseudoClassType.AnyLink;
    case "link":
      return PseudoClassType.Link;
    case "visited":
      return PseudoClassType.Visited;
    case "local-link":
      return PseudoClassType.LocalLink;
    case "target":
      return PseudoClassType.Target;
    case "target-within":
      return PseudoClassType.TargetWithin;
    case "scope":
      return PseudoClassType.Scope;
    case "hover":
      return PseudoClassType.Hover;
    case "active":
      return PseudoClassType.Active;
    case "focus":
      return PseudoClassType.Active;
    case "focus-visible":
      return PseudoClassType.FocusVisible;
    case "focus-within":
      return PseudoClassType.FocusWithin;
    case "current":
      return PseudoClassType.Current;
    case "past":
      return PseudoClassType.Past;
    case "future":
      return PseudoClassType.Future;
    case "playing":
      return PseudoClassType.Playing;
    case "paused":
      return PseudoClassType.Paused;
    case "seeking":
      return PseudoClassType.Seeking;
    case "buffering":
      return PseudoClassType.Buffering;
    case "stalled":
      return PseudoClassType.Stalled;
    case "muted":
      return PseudoClassType.Muted;
    case "volume-locked":
      return PseudoClassType.VolumeLocked;
    case "enabled":
      return PseudoClassType.Enabled;
    case "disabled":
      return PseudoClassType.Disabled;
    case "read-only":
      return PseudoClassType.ReadOnly;
    case "read-write":
      return PseudoClassType.ReadWrite;
    case "placeholder-shown":
      return PseudoClassType.PlaceholderShown;
    case "default":
      return PseudoClassType.Default;
    case "checked":
      return PseudoClassType.Checked;
    case "indeterminate":
      return PseudoClassType.Indeterminate;
    case "blank":
      return PseudoClassType.Blank;
    case "valid":
      return PseudoClassType.Valid;
    case "invalid":
      return PseudoClassType.Invalid;
    case "in-range":
      return PseudoClassType.InRange;
    case "out-of-range":
      return PseudoClassType.OutOfRange;
    case "required":
      return PseudoClassType.Required;
    case "optional":
      return PseudoClassType.Optional;
    case "user-valid":
      return PseudoClassType.UserValid;
    case "user-invalid":
      return PseudoClassType.UserInvalid;
    case "root":
      return PseudoClassType.Root;
    case "empty":
      return PseudoClassType.Empty;
    case "nth-child":
      return PseudoClassType.NthChild;
    case "nth-last-child":
      return PseudoClassType.NthLastChild;
    case "first-child":
      return PseudoClassType.FirstChild;
    case "last-child":
      return PseudoClassType.LastChild;
    case "only-child":
      return PseudoClassType.OnlyChild;
    case "nth-of-type":
      return PseudoClassType.NthOfType;
    case "nth-last-of-type":
      return PseudoClassType.NthLastOfType;
    case "first-of-type":
      return PseudoClassType.FirstOfType;
    case "last-of-type":
      return PseudoClassType.LastOfType;
    case "only-of-type":
      return PseudoClassType.OnlyOfType;
    default:
      return null;
  }
}
