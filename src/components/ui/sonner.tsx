
import { useTheme } from "@/components/ui/theme-provider";
import { Toaster as Sonner } from "sonner";

interface ToasterProps {
  ...React.ComponentProps<typeof Sonner>;
  theme?: "light" | "dark" | "system";
}

const Toaster = ({ theme = "system", className, ...props }: ToasterProps) => {
  const { theme: currentTheme } = useTheme();

  return (
    <Sonner
      theme={theme === "system" ? currentTheme : theme}
      className={className}
      toastOptions={{
        classNames: {
          toast:
            "group toast group flex w-full items-center justify-between space-x-4 rounded-md border p-6 pr-8 shadow-lg [&>div[data-icon]]:shrink-0 [&>div[data-icon]]:rounded-full [&>div:first-child]:shrink-0 data-[visible=false]:animate-out data-[visible=false]:fade-out data-[swipe=end]:animate-out data-[swipe=end]:slide-out-right data-[swipe=move]:translate-x-[var(--x)] [&>div[data-icon]]:border [&>div[data-icon]]:p-2",
          title: "text-lg font-semibold [&+div]:text-sm",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          closeButton:
            "rounded-full p-1.5 text-foreground/50 opacity-70 transition-opacity hover:text-foreground hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
          description: "text-sm",
          error: "group destructive border-red-300 bg-red-500 text-white",
          info: "group border-blue-200 bg-blue-100 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100",
          success: "group border-green-200 bg-green-100 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100",
          warning: "group border-yellow-200 bg-yellow-100 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100",
          toast: "[&>div[data-icon]]:bg-muted-foreground/20",
          default: "group border-border bg-background text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
