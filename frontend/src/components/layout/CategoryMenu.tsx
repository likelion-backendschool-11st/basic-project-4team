import React from 'react';
import { Link } from 'react-router-dom';
import { categoryMenuCopy as copy } from '../../data/layout';
import { useCategoryTree } from '../../hooks/layout/useCategoryTree';
import { useHoverMenu } from '../../hooks/layout/useHoverMenu';
import { Icon } from '../common/Icon';

interface CategoryMenuProps {
  readonly className?: string;
}

/**
 * 헤더 카테고리 메뉴 (REQ-HEADER-007·008). 마우스를 올리면 대-소 카테고리가 열리고,
 * 누르면 그 카테고리의 판매글 검색 결과(P-009)로 이동한다. 항목은 GET /categories.
 */
export const CategoryMenu: React.FC<CategoryMenuProps> = ({ className = '' }) => {
  const menu = useHoverMenu();
  const tree = useCategoryTree();

  return (
    <div className={`h-full flex items-center ${className}`} onMouseEnter={menu.show} onMouseLeave={menu.hide}>
      <button
        aria-expanded={menu.open}
        aria-haspopup="true"
        className={`h-full flex items-center gap-1 whitespace-nowrap font-ui-label text-ui-label transition-colors ${
          menu.open ? 'text-primary-container' : 'text-on-surface-variant hover:text-on-surface'
        }`}
        onClick={menu.toggle}
        type="button"
      >
        <Icon className="text-[18px]" name={copy.icon} />
        <span>{copy.label}</span>
        <Icon className={`text-[18px] transition-transform ${menu.open ? 'rotate-180' : ''}`} name="expand_more" />
      </button>

      {menu.open && (
        <div className="absolute left-0 right-0 top-full z-40 bg-canvas border-b border-hairline shadow-lg">
          <div className="max-w-7xl mx-auto px-gutter-desktop py-space-lg">
            {tree.status === 'loading' && <p className="font-body-sm text-body-sm text-muted">{copy.loading}</p>}
            {tree.status === 'error' && <p className="font-body-sm text-body-sm text-error">{copy.error}</p>}
            {tree.status === 'success' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-lg">
                {tree.categories.map((root) => (
                  <div className="flex flex-col gap-space-xs min-w-0" key={root.id}>
                    <Link
                      className="font-ui-label text-ui-label text-ink hover:text-primary-container transition-colors"
                      onClick={menu.close}
                      to={copy.searchTo(root.code)}
                    >
                      {root.name}
                    </Link>
                    <ul className="flex flex-col gap-1 border-l border-hairline pl-space-sm">
                      {root.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary-container transition-colors"
                            onClick={menu.close}
                            to={copy.searchTo(child.code)}
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link
                          className="font-caption text-caption text-muted hover:text-primary-container transition-colors"
                          onClick={menu.close}
                          to={copy.searchTo(root.code)}
                        >
                          {copy.allLabel(root.name)}
                        </Link>
                      </li>
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryMenu;
