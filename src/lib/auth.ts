import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { User as NextAuthUser } from "next-auth";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET ?? "insecure-dev-secret",
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        await dbConnect();
        const user = await User.findOne({ email: parsed.data.email, isActive: true }).select(
          "+passwordHash"
        );
        if (!user) return null;

        const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!ok) return null;

        user.lastLoginAt = new Date();
        await user.save();

        const out = {
          id: String(user._id),
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        } as unknown as NextAuthUser & { role: string };
        return out;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = "role" in user ? (user as NextAuthUser & { role?: string }).role ?? null : null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role ?? null;
      }
      return session;
    },
  },
};

