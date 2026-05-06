"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useNavigationProgress } from "./NavigationProgressContext";

type LinkProps = React.ComponentProps<typeof Link>;

export function ProgressLink({
  href,
  onClick,
  children,
  replace,
  scroll,
  ...rest
}: LinkProps) {
  const router = useRouter();
  const { acquire } = useNavigationProgress();
  const [isPending, startTransition] = React.useTransition();
  const releaseRef = React.useRef<(() => void) | null>(null);

  // isPending이 켜진 동안 progress 카운터 점유, 꺼지면 해제.
  // 진짜 navigation 완료(서버 컴포넌트 fetch + RSC payload 적용)까지 isPending 유지됨.
  React.useEffect(() => {
    if (isPending && !releaseRef.current) {
      releaseRef.current = acquire();
    } else if (!isPending && releaseRef.current) {
      releaseRef.current();
      releaseRef.current = null;
    }
  }, [isPending, acquire]);

  // unmount 시 카운터 누수 방지
  React.useEffect(() => {
    return () => {
      if (releaseRef.current) {
        releaseRef.current();
        releaseRef.current = null;
      }
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (e.button !== 0) return;

    const target = (e.currentTarget as HTMLAnchorElement).target;
    if (target && target !== "_self") return;

    // href가 string이 아니면(UrlObject) Link 기본 동작에 위임
    if (typeof href !== "string") return;
    // 외부 URL은 Link/브라우저 기본 동작
    if (/^[a-z]+:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    // 같은 path & search 면 navigation 발생 안 함 → progress 안 띄움
    try {
      const url = new URL(href, window.location.href);
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
    } catch {
      return;
    }

    e.preventDefault();
    startTransition(() => {
      if (replace) router.replace(href, { scroll: scroll ?? true });
      else router.push(href, { scroll: scroll ?? true });
    });
  };

  return (
    <Link href={href} onClick={handleClick} replace={replace} scroll={scroll} {...rest}>
      {children}
    </Link>
  );
}
