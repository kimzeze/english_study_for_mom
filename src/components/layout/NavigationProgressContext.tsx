"use client";

import * as React from "react";

type NavigationProgressValue = {
  pendingCount: number;
  acquire: () => () => void;
};

const NavigationProgressContext =
  React.createContext<NavigationProgressValue | null>(null);

export function NavigationProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pendingCount, setPendingCount] = React.useState(0);

  // 여러 ProgressLink가 동시에 진행 중일 수도 있어 카운터 방식.
  // acquire() 호출 시 카운터 +1, 반환된 release를 호출하면 -1.
  const acquire = React.useCallback(() => {
    setPendingCount((c) => c + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      setPendingCount((c) => Math.max(0, c - 1));
    };
  }, []);

  const value = React.useMemo(
    () => ({ pendingCount, acquire }),
    [pendingCount, acquire]
  );

  return (
    <NavigationProgressContext.Provider value={value}>
      {children}
    </NavigationProgressContext.Provider>
  );
}

export function useNavigationProgress() {
  const ctx = React.useContext(NavigationProgressContext);
  if (!ctx)
    throw new Error(
      "useNavigationProgress must be used within NavigationProgressProvider"
    );
  return ctx;
}
