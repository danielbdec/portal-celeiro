import NextAuth, { type NextAuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token }) {
      if (!token.perfil) {
        try {
          const email = (token.email || "").toLowerCase();
          console.log("📧 EMAIL EXTRAÍDO DO TOKEN:", email);
          const res = await fetch(`${process.env.NEXTAUTH_URL}/api/usuarios`);
          const usuarios = await res.json();
          console.log("🔍 USUÁRIOS RECEBIDOS:", usuarios);
          const usuario = usuarios.find((u: any) => (u.email || "").toLowerCase() === email);
          token.perfil = usuario?.perfil || "user";
        } catch (err) {
          console.error("🔴 FALHA AO BUSCAR PERFIL:", err);
          token.perfil = "user";
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.user.perfil = token.perfil as string;
      return session;
    },
    async redirect({ url, baseUrl }) {
      return `${baseUrl}/painel`;
    },
  },
  pages: {
    // Redireciona diretamente para o login do provedor, sem uma página intermediária.
    signIn: "/api/auth/signin/azure-ad",
  },
  debug: true,
};