// components/Layout.tsx
import React from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { i18n } = useTranslation("common");
  const currentLanguage = i18n.language;
  const changeLanguage = (lang: string) => {
    router.push(router.asPath, router.asPath, { locale: lang });
  };

  const getLanguageName = (locale: string) => {
    switch (locale) {
      case "en":
        return "English";
      case "uk":
        return "Українська";
      default:
        return "";
    }
  };

  return (
    <>
      <Navbar bg="light" expand="lg">
        <Container>
          <Navbar.Brand>
            <Link style={{ textDecoration: "none" }} href={"/"}>
              Ukrbus
            </Link>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <NavDropdown
                title={getLanguageName(currentLanguage)}
                id="basic-nav-dropdown"
              >
                <NavDropdown.Item onClick={() => changeLanguage("en")}>
                  English
                </NavDropdown.Item>
                <NavDropdown.Item onClick={() => changeLanguage("uk")}>
                  Українська
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      {children}
    </>
  );
};

export default Layout;
