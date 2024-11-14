"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NavigationMenuLink } from "@/components/ui/navigation-menu";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function UserNav({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // Ensuring the component is mounted before calling `useRouter`
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle logout
  const handleLogout = () => {
    // Clear JWT token from localStorage
    localStorage.removeItem("jwt");

    // Optionally, redirect to the login page or homepage
    router.push("/login");  // Adjust the route as needed
  };

  // Return null or loading state if not mounted yet
  if (!isMounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={"https://miro.medium.com/v2/resize:fit:640/format:webp/1*W35QUSvGpcLuxPo3SRTH4w.png"} alt="" />
            <AvatarFallback>UT</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <NavigationMenuLink href="/profile">
            <DropdownMenuItem>Profile</DropdownMenuItem>
          </NavigationMenuLink>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {/* Logout Button */}
        <DropdownMenuItem onClick={handleLogout} className="text-red-500">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
