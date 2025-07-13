import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function CategoryButtons() {
  const [active, setActive] = useState("coffee");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get("category");

    if (
      category &&
      ["coffee", "non-coffee", "specialty", "grub"].includes(category)
    ) {
      setActive(category);
    }
  }, []);

  const handleCategoryChange = (category: string) => {
    setActive(category);

    const url = new URL(window.location.href);
    url.searchParams.set("category", category);
    window.history.pushState({}, "", url);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant={active === "coffee" ? "secondary" : "ghost"}
        size="lg"
        onClick={() => handleCategoryChange("coffee")}
      >
        Coffee
      </Button>
      <Button
        variant={active === "non-coffee" ? "secondary" : "ghost"}
        size="lg"
        onClick={() => handleCategoryChange("non-coffee")}
      >
        Non Coffee
      </Button>
      <Button
        variant={active === "specialty" ? "secondary" : "ghost"}
        size="lg"
        onClick={() => handleCategoryChange("specialty")}
      >
        Specialty
      </Button>
      <Button
        variant={active === "grub" ? "secondary" : "ghost"}
        size="lg"
        onClick={() => handleCategoryChange("grub")}
      >
        Grub
      </Button>
    </div>
  );
}
