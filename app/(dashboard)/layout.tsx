'use client';
import { BookOpen, Briefcase, History, Home, Library, LogOut, Package, PanelLeft, Tag, User, UserCog, Users } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { Roles } from '@/types/user.interface'
import { Analytics } from '@vercel/analytics/react'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { NavItem } from './nav-item'
import Providers from './providers'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <Providers>
      <main className="flex min-h-screen w-full flex-col bg-muted/40">
        <DesktopNav onLogout={handleLogout} />
        <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <MobileNav onLogout={handleLogout} />
          </header>
          <main className="grid flex-1 items-start gap-2 p-4 sm:px-6 sm:py-0 md:gap-4 bg-muted/40">
            {children}
          </main>
        </div>
        <Analytics />
      </main>
    </Providers>
  );
}

function DesktopNav({ onLogout }: { onLogout: () => void }) {
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const isAdmin = userRole === Roles.ADMIN;
  const isLibrarian = userRole === Roles.LIBRARIAN;
  const isUser = userRole === Roles.USER;

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <NavItem href="/" label="Главная">
          <Home className="h-5 w-5" />
        </NavItem>

        <NavItem href="/books" label="Книги">
          <BookOpen className="h-5 w-5" />
        </NavItem>

        <NavItem href="/authors" label="Авторы">
          <Users className="h-5 w-5" />
        </NavItem>

        <NavItem href="/genres" label="Жанры">
          <Tag className="h-5 w-5" />
        </NavItem>

        <NavItem href="/libraries" label="Библиотеки">
          <Library className="h-5 w-5" />
        </NavItem>

        {/* Только для ADMIN и LIBRARIAN */}
        {(isAdmin || isLibrarian) && (
          <NavItem href="/book-instances" label="Экземпляры">
            <Package className="h-5 w-5" />
          </NavItem>
        )}

        {/* Только для ADMIN */}
        {isAdmin && (
          <NavItem href="/users" label="Пользователи">
            <UserCog className="h-5 w-5" />
          </NavItem>
        )}

        {/* Только для ADMIN и LIBRARIAN */}
        {(isAdmin || isLibrarian) && (
          <NavItem href="/librarian-panel" label="Панель библиотекаря">
            <Briefcase className="h-5 w-5" />
          </NavItem>
        )}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
        <NavItem href="/my-activity" label="Моя активность">
          <History className="h-5 w-5" />
        </NavItem>
        <NavItem href="/profile" label="Мой профиль">
          <User className="h-5 w-5" />
        </NavItem>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onLogout}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Выход</TooltipContent>
        </Tooltip>
      </nav>
    </aside>
  );
}

function MobileNav({ onLogout }: { onLogout: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const handleClose = () => setIsOpen(false);
  const { data: session } = useSession();
  const userRole = session?.user?.role;
  const isAdmin = userRole === Roles.ADMIN;
  const isLibrarian = userRole === Roles.LIBRARIAN;
  const isUser = userRole === Roles.USER;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="outline" className="sm:hidden">
          <PanelLeft className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sm:max-w-xs p-4">
        <nav className="grid gap-4 text-lg font-medium">
          <Link
            href="/"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            <Home className="h-5 w-5" />
            Главная
          </Link>

          <Link
            href="/books"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            <BookOpen className="h-5 w-5" />
            Книги
          </Link>

          <Link
            href="/authors"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            <Users className="h-5 w-5" />
            Авторы
          </Link>

          <Link
            href="/genres"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            <Tag className="h-5 w-5" />
            Жанры
          </Link>

          <Link
            href="/libraries"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            <Library className="h-5 w-5" />
            Библиотеки
          </Link>

          {/* Только для ADMIN и LIBRARIAN */}
          {(isAdmin || isLibrarian) && (
            <Link
              href="/book-instances"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              onClick={handleClose}
            >
              <Package className="h-5 w-5" />
              Экземпляры
            </Link>
          )}

          {/* Только для ADMIN */}
          {isAdmin && (
            <Link
              href="/users"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              onClick={handleClose}
            >
              <UserCog className="h-5 w-5" />
              Пользователи
            </Link>
          )}

          {/* Только для ADMIN и LIBRARIAN */}
          {(isAdmin || isLibrarian) && (
            <Link
              href="/librarian-panel"
              className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
              onClick={handleClose}
            >
              <Briefcase className="h-5 w-5" />
              Панель библиотекаря
            </Link>
          )}

          <Link
            href="/my-activity"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            <History className="h-5 w-5" />
            Моя активность
          </Link>

          <Link
            href="/profile"
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
            onClick={handleClose}
          >
            <User className="h-5 w-5" />
            Профиль
          </Link>

          <button
            onClick={() => {
              onLogout();
              handleClose();
            }}
            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
