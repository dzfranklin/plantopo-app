import { forwardRef } from "react";
import { PageTitle } from "./PageTitle";

import { Avatar } from "@/components/avatar";
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from "@/components/dropdown";
import {
  Navbar,
  NavbarItem,
  NavbarLabel,
  NavbarSection,
  NavbarSpacer,
} from "@/components/navbar";
import {
  Sidebar,
  SidebarBody,
  SidebarHeader,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
} from "@/components/sidebar";
import { StackedLayout } from "@/components/stacked-layout";
import {
  ArrowRightStartOnRectangleIcon,
  Cog8ToothIcon,
} from "@heroicons/react/16/solid";
import {
  getSignInUrl,
  getSignUpUrl,
  getUser,
  Impersonation,
} from "@workos-inc/authkit-nextjs";

const navItems = [
  { label: "Home", url: "/" },
  { label: "My Tracks", url: "/tracks" },
];

export const Layout = forwardRef(
  async (
    {
      children,
      pageTitle,
      ...props
    }: {
      children?: React.ReactNode;
      pageTitle?: string;
    } & React.ComponentPropsWithoutRef<"div">,
    ref: React.ForwardedRef<HTMLDivElement>
  ) => {
    const { user } = await getUser();
    const signInUrl = await getSignInUrl();
    const signUpUrl = await getSignUpUrl();

    return (
      <StackedLayout
        navbar={
          <Navbar>
            <NavbarSection>
              <NavbarLabel>PlanTopo</NavbarLabel>
            </NavbarSection>
            <NavbarSection className="max-lg:hidden">
              {navItems.map(({ label, url }) => (
                <NavbarItem key={label} href={url}>
                  {label}
                </NavbarItem>
              ))}
            </NavbarSection>
            <NavbarSpacer />
            <NavbarSection>
              {user ? (
                <Dropdown>
                  <DropdownButton as={NavbarItem}>
                    <Avatar src={user.profilePictureUrl} square />{" "}
                    {/* TODO: default avatar */}
                  </DropdownButton>
                  <DropdownMenu className="min-w-64" anchor="bottom end">
                    <DropdownItem href="/settings">
                      <Cog8ToothIcon />
                      <DropdownLabel>Settings</DropdownLabel>
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem href="/auth/logout">
                      <ArrowRightStartOnRectangleIcon />
                      <DropdownLabel>Sign out</DropdownLabel>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              ) : (
                <>
                  <NavbarItem href={signInUrl}>Sign in</NavbarItem>
                  <NavbarItem href={signUpUrl}>Sign up</NavbarItem>
                </>
              )}
            </NavbarSection>
          </Navbar>
        }
        sidebar={
          <Sidebar>
            <SidebarHeader>
              <SidebarLabel>PlanTopo</SidebarLabel>
            </SidebarHeader>
            <SidebarBody>
              <SidebarSection>
                {navItems.map(({ label, url }) => (
                  <SidebarItem key={label} href={url}>
                    {label}
                  </SidebarItem>
                ))}
              </SidebarSection>
            </SidebarBody>
          </Sidebar>
        }
      >
        <PageTitle title={pageTitle} />
        <Impersonation />
        <div {...props} ref={ref}>
          {children}
        </div>
      </StackedLayout>
    );
  }
);
Layout.displayName = "Layout";
