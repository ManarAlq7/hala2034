/* -------------------------------------------------------------------------- */
/*  مجموعة أيقونات واحدة                                                        */
/*                                                                             */
/*  خطوط بسمك ١٫٧ ونهايات مستديرة على شبكة ٢٤×٢٤ — نظام واحد بدل خليط من       */
/*  الرموز التعبيرية ذات الأحجام والأنماط المختلفة. اللون يرث من النص دائماً.    */
/* -------------------------------------------------------------------------- */

type IconProps = { className?: string };

const wrap = (path: React.ReactNode) =>
  function Icon({ className = "h-[18px] w-[18px]" }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden
      >
        {path}
      </svg>
    );
  };

export const IconOverview = wrap(
  <>
    <rect x="3" y="3" width="7.5" height="8.5" rx="1.5" />
    <rect x="13.5" y="3" width="7.5" height="5" rx="1.5" />
    <rect x="3" y="14.5" width="7.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="11" width="7.5" height="10" rx="1.5" />
  </>,
);

export const IconIssues = wrap(
  <>
    <path d="M12 3.5 21 19H3z" />
    <path d="M12 10v3.5" />
    <path d="M12 16.5h.01" />
  </>,
);

export const IconMap = wrap(
  <>
    <path d="m3 6.5 6-2.5 6 2.5 6-2.5v13.5l-6 2.5-6-2.5-6 2.5z" />
    <path d="M9 4v13.5" />
    <path d="M15 6.5V20" />
  </>,
);

export const IconReports = wrap(
  <>
    <path d="M6 3h8l4.5 4.5V21H6z" />
    <path d="M14 3v5h4.5" />
    <path d="M9.5 13h6" />
    <path d="M9.5 17h4" />
  </>,
);

export const IconAnalytics = wrap(
  <>
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <path d="M8.5 20v-6" />
    <path d="M13 20V8.5" />
    <path d="M17.5 20v-9" />
  </>,
);

export const IconSettings = wrap(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 14.5a1.6 1.6 0 0 0 .32 1.77l.06.05a2 2 0 1 1-2.83 2.83l-.05-.06a1.6 1.6 0 0 0-1.77-.32 1.6 1.6 0 0 0-.97 1.47V21a2 2 0 1 1-4 0v-.11a1.6 1.6 0 0 0-1.05-1.46 1.6 1.6 0 0 0-1.77.32l-.05.06a2 2 0 1 1-2.83-2.83l.06-.05a1.6 1.6 0 0 0 .32-1.77 1.6 1.6 0 0 0-1.47-.97H3a2 2 0 1 1 0-4h.11a1.6 1.6 0 0 0 1.46-1.05 1.6 1.6 0 0 0-.32-1.77l-.06-.05a2 2 0 1 1 2.83-2.83l.05.06a1.6 1.6 0 0 0 1.77.32H9a1.6 1.6 0 0 0 .97-1.47V3a2 2 0 1 1 4 0v.11a1.6 1.6 0 0 0 .97 1.47 1.6 1.6 0 0 0 1.77-.32l.05-.06a2 2 0 1 1 2.83 2.83l-.06.05a1.6 1.6 0 0 0-.32 1.77V9a1.6 1.6 0 0 0 1.47.97H21a2 2 0 1 1 0 4h-.11a1.6 1.6 0 0 0-1.47.97z" />
  </>,
);

export const IconLogout = wrap(
  <>
    <path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14" />
    <path d="M10 16.5 5.5 12 10 7.5" />
    <path d="M5.5 12H15" />
  </>,
);

export const IconMenu = wrap(
  <>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </>,
);

export const IconClose = wrap(
  <>
    <path d="m6 6 12 12" />
    <path d="m18 6-12 12" />
  </>,
);

export const IconSearch = wrap(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4.5 4.5" />
  </>,
);

export const IconAlert = wrap(
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 8v4.5" />
    <path d="M12 15.5h.01" />
  </>,
);
