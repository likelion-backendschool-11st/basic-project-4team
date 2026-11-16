import { useCallback } from 'react';

/** 클립보드 API를 못 쓸 때(http로 IP 접속 등 보안 컨텍스트가 아닌 경우)의 예비 복사. */
function copyWithTextarea(text: string): boolean {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

/** 클립보드에 text를 복사한다. 성공하면 true. */
export async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 권한 거부 등 — 예비 방식으로 한 번 더 시도한다.
    }
  }
  return copyWithTextarea(text);
}

/**
 * 판매글 공유 주소를 복사한다 (REQ-DETAIL-003). 지금 주소창이 아니라 path(공개 상세 주소)를 복사해서
 * 내 판매글 화면(/my/listings/:id)에서 눌러도 다른 사람이 열 수 있는 /listings/:id가 복사된다.
 * 검색어·해시도 붙지 않는다.
 */
export const useCopyUrl = (path: string, onDone?: (copied: boolean) => void) =>
  useCallback(() => {
    void copyText(`${window.location.origin}${path}`).then((copied) => onDone?.(copied));
  }, [path, onDone]);
