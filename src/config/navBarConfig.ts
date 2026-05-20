import {
  LinkPreset,
  type NavBarConfig,
  type NavBarLink,
  type NavBarSearchConfig,
  NavBarSearchMethod,
} from "../types/config";

// 导航栏配置
const getNavBarConfig = (): NavBarConfig => {
  const links: (NavBarLink | LinkPreset)[] = [
    // 主页
    LinkPreset.Home,

    // 归档
    LinkPreset.Archive,
  ];

  return { links } as NavBarConfig;
};

// 导航搜索配置
export const navBarSearchConfig: NavBarSearchConfig = {
  method: NavBarSearchMethod.PageFind,
};

export const navBarConfig: NavBarConfig = getNavBarConfig();
