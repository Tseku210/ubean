import { MenuIcon, XIcon } from "lucide-react";
import { Button } from "./button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
} from "./drawer";
import { useState } from "react";

interface Props {
  navLinks: Record<string, string>;
}

export default function MobileMenu({ navLinks }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="size-6 md:hidden">
          <MenuIcon size={16} className="size-full" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-secondary !w-screen border-none">
        <DrawerHeader>
          <DrawerClose className="p-8" asChild>
            <Button variant="ghost" size="icon" className="size-6 self-end">
              <XIcon className="text-primary size-6" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="text-h5 mt-8 flex h-full w-full flex-col items-center gap-[60px] text-white uppercase">
          {Object.entries(navLinks).map(([label, href]) => (
            <a href={href} className="hover:underline" data-astro-prefetch>
              {label}
            </a>
          ))}
        </div>
        <p className="text-b4 mb-10 text-center text-white">
          © 2025 All rights reserved
        </p>
      </DrawerContent>
    </Drawer>
  );
}
