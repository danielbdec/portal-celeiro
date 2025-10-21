"use client";

import { useSession, signOut, signIn } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Spin } from "antd";
import {
  House,
  Notebook,
  Users,
  ShieldUser,
  SquareCheckBig,
  UserPlus,
  Contact2,
  LogOut,
  ArrowBigLeft,
  ArrowBigRight,
  BookUser,
  DollarSign,
  Settings2,
  FileSignature,
} from "lucide-react";
import { LoadingOutlined } from "@ant-design/icons";
import Image from "next/image";

import ChatWidget from "../components/ChatWidget";

import "@refinedev/antd/dist/reset.css";
import "./globals.css";
import "./custom-sidebar.css";

// Hook customizado para verificar o tamanho da tela
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const router = useRouter();
  const { data: session, status }: { data: any; status: "loading" | "authenticated" | "unauthenticated" } = useSession();
  const isMobile = useIsMobile();

  // O estado e as funções para o ModalDetalhes
  const [modalVisivel, setModalVisivel] = useState(false);
  const [chave, setChave] = useState('');
  const [fornecedor, setFornecedor] = useState('');

  const handleModalClose = () => {
    setModalVisivel(false);
    setChave('');
    setFornecedor('');
  };

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);

  if (status === "loading") {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Spin tip="Carregando..." indicator={<LoadingOutlined style={{ fontSize: 48, color: "#52c41a" }} spin />} />
      </div>
    );
  }

  // Redireciona o usuário diretamente para o provedor de login se ele não estiver autenticado
  if (!session) {
    signIn("azure-ad");
    return null;
  }
  
  const greenSpinner = <LoadingOutlined style={{ fontSize: 48, color: "#52c41a" }} spin />;

  // Corrigido o erro de tipagem removendo 'status === "loading"'
  if (loadingLogout) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <Spin tip="Saindo..." indicator={greenSpinner} />
      </div>
    );
  }

  const getSelectedKey = () => {
    if (!pathname) return undefined;

    if (pathname.startsWith("/painel/perfil")) return "perfil";
    if (pathname.startsWith("/painel/relatorios/meus-pedidos")) return "meus-pedidos";
    if (pathname.startsWith("/painel/relatorios")) return "relatorios";
    if (pathname.startsWith("/painel/cadastro-usuarios")) return "cadastro-usuarios";
    if (pathname.startsWith("/painel/liberacao-pedidos")) return "liberacao";
    if (pathname.startsWith("/painel/cadastro-cliente")) return "cadastro-cliente";
    if (pathname.startsWith("/painel/cadastro-contato")) return "cadastro-contato";
    if (pathname.startsWith("/painel/cadastro-area")) return "cadastro-area";
    if (pathname.startsWith("/painel/configuracoes/envio-assinatura")) return "envio-assinatura";
    if (pathname.startsWith("/painel/configuracoes")) return "configuracoes";
    return undefined;
  };

  const perfil = (session?.user?.perfil || "").toLowerCase().trim();
  const iconSize = collapsed ? 24 : 18;

  const menuItems: any[] = [
    {
      key: "inicio",
      icon: <House size={iconSize} color="white" />,
      label: "Início",
      onClick: () => router.push("/painel"),
    },
    {
      key: "perfil",
      icon: <ShieldUser size={iconSize} color="white" />,
      label: "Meu Perfil",
      onClick: () => router.push("/painel/perfil"),
    },
    {
      key: "cadastro",
      icon: <UserPlus size={iconSize} color="white" />,
      label: "Cadastros",
      children: [
        { key: "cadastro-cliente", icon: <UserPlus size={18} color="white" />, label: "Clientes", onClick: () => router.push("/painel/cadastro-cliente") },
        { key: "cadastro-contato", icon: <Contact2 size={18} color="white" />, label: "Contatos", onClick: () => router.push("/painel/cadastro-contato") },
        { key: "cadastro-area", icon: <SquareCheckBig size={18} color="white" />, label: "Áreas", onClick: () => router.push("/painel/cadastro-area") },
      ],
    },
    {
      key: "relatorios",
      icon: <Notebook size={iconSize} color="white" />,
      label: "Relatórios",
      children: [
        { key: "meus-pedidos", icon: <BookUser size={18} color="white" />, label: "Pedidos", onClick: () => router.push("/painel/relatorios/meus-pedidos") },
      ],
    },
  ];

  if (perfil === "admin") {
    menuItems.push({ key: "cadastro-usuarios", icon: <Users size={iconSize} color="white" />, label: "Usuários", onClick: () => router.push("/painel/cadastro-usuarios") });
  }
  if (["aprovador", "admin"].includes(perfil)) {
    menuItems.push({ key: "liberacao", icon: <SquareCheckBig size={iconSize} color="white" />, label: "Liberação", onClick: () => router.push("/painel/liberacao-pedidos") });
  }
  if (["credito", "admin"].includes(perfil)) {
    menuItems.push({
      key: "credito", icon: <DollarSign size={iconSize} color="white" />, label: "Crédito",
      children: [{ key: "cadastro-cred-cli", icon: <UserPlus size={18} color="white" />, label: "Clientes", onClick: () => router.push("/painel/cadastro-cred-cli") }],
    });
  }
  if (perfil === "admin") {
    menuItems.push({ key: "cadastro-usuarios", icon: <Users size={iconSize} color="white" />, label: "Usuários", onClick: () => router.push("/painel/cadastro-usuarios") });
  }
  if (["aprovador", "admin"].includes(perfil)) {
    menuItems.push({ key: "liberacao", icon: <SquareCheckBig size={iconSize} color="white" />, label: "Liberação", onClick: () => router.push("/painel/liberacao-pedidos") });
  }
  if (["aprovador", "admin"].includes(perfil)) {
    menuItems.push({
      key: "configuracoes", icon: <Settings2 size={iconSize} color="white" />, label: "Configurações",
      children: [{ key: "envio-assinatura", icon: <FileSignature size={18} color="white" />, label: "Envio Assinatura", onClick: () => router.push("/painel/configuracoes/envio-assinatura") }],
    });
  }

  const sidebarProps = isMobile ? {} : {
    onMouseEnter: () => setCollapsed(false),
    onMouseLeave: () => setCollapsed(true),
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div
        {...sidebarProps}
        style={{
          width: collapsed ? 80 : 240,
          transition: "width 0.3s ease-in-out",
          background: "linear-gradient(to bottom, var(--cor-sidebar-gradiente-topo), var(--cor-sidebar-gradiente-base))",
          padding: "1rem 0.5rem",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingLeft: collapsed ? 0 : 16, paddingRight: collapsed ? 0 : 16 }}>
            <Image
              src="/logo.png"
              alt="Logo"
              width={collapsed ? 70 : 140}
              height={collapsed ? 40 : 60}
              style={{ objectFit: "contain", transition: "all 0.3s ease-in-out" }}
            />
            
            {isMobile && (
              <div
                onClick={() => setCollapsed(!collapsed)}
                style={{ cursor: "pointer", color: "white", fontSize: "13px", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", height: 45, width: "100%", paddingLeft: collapsed ? 0 : 4, marginTop: 13, marginBottom: 12 }}
              >
                {collapsed ? <ArrowBigRight size={25} /> : <ArrowBigLeft size={25} />}
              </div>
            )}
          </div>
          <Menu
            mode="inline"
            inlineCollapsed={collapsed}
            selectedKeys={getSelectedKey() ? [getSelectedKey() as string] : []}
            style={{ background: "transparent", borderRight: 0, marginTop: "2rem" }}
            items={menuItems}
          />
        </div>
        <div
          onClick={async () => {
            setLoadingLogout(true);
            const redirectUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=${process.env.NEXTAUTH_URL}`;
            await signOut({ redirect: false });
            window.location.href = redirectUrl;
          }}
          style={{ position: 'absolute', bottom: '1rem', left: '0.5rem', right: '0.5rem', color: "white", cursor: "pointer", padding: "0.5rem 1rem", display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: collapsed ? 'center' : 'flex-start' }}
        >
          <LogOut size={iconSize} />
          <span style={{ transition: 'width 0.2s ease-in-out', whiteSpace: 'nowrap', width: collapsed ? 0 : 'auto', overflow: 'hidden' }}>
            Sair
          </span>
        </div>
      </div>
      <main style={{ flex: 1, overflow: "auto", padding: "1rem", position: "relative" }}>
        {children}
        <ChatWidget />
      </main>
    </div>
  );
}