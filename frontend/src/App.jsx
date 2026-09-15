import { useState } from "react";
import { Badge } from "./components/atoms/Badge.jsx";
import { Button } from "./components/atoms/Button.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./components/atoms/Card.jsx";
import { Kbd } from "./components/atoms/Kbd.jsx";
import { ThemeToggle } from "./components/atoms/ThemeToggle.jsx";
import { CopyButton } from "./components/molecules/CopyButton.jsx";
import { EmptyState } from "./components/molecules/EmptyState.jsx";
import { FormField } from "./components/molecules/FormField.jsx";
import { StatCard } from "./components/molecules/StatCard.jsx";
import { useConfirm } from "./context/ConfirmContext.jsx";
import { useToast } from "./context/ToastContext.jsx";

export default function App() {
  const toast = useToast();
  const confirm = useConfirm();

  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState("");
  const [hasLinks, setHasLinks] = useState(true);

  const handleShorten = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setUrlError("Please enter a valid URL to shorten");
      return;
    }
    setUrlError("");
    toast.success("Short link created: https://short.link/x9aB1");
    setUrlInput("");
    setHasLinks(true);
  };

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: "Delete Short Link?",
      message:
        "Are you sure you want to delete this link? All existing traffic will be interrupted.",
      confirmText: "Delete Link",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (isConfirmed) {
      setHasLinks(false);
      toast.success("Short link deleted successfully.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 md:p-8">
      <div className="w-full max-w-4xl space-y-6">
        {/* Top Navbar Bar */}
        <header className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <i className="ri-links-line text-lg leading-none" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold tracking-tight text-foreground">
                  Link Shortener
                </h1>
                <Badge variant="primary" size="sm">
                  v1.0
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                High-Density Craft Design System
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground">
              Search <Kbd>⌘K</Kbd>
            </span>
            <ThemeToggle />
          </div>
        </header>

        {/* 1. StatCard Shell Row (High Density Metrics) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Clicks"
            value="14,290"
            change="+18.4%"
            icon="ri-cursor-line"
            description="Across all shortened links"
          />
          <StatCard
            title="Active Links"
            value="38"
            change="+3"
            icon="ri-links-line"
            description="Active redirect rules"
          />
          <StatCard
            title="Bounce Rate"
            value="2.1%"
            change="-0.5%"
            icon="ri-pie-chart-line"
            description="Direct destination load"
          />
        </div>

        {/* 2. FormField + Card Shell */}
        <Card>
          <CardHeader
            action={
              <Button
                variant="outline"
                size="sm"
                icon="ri-notification-line"
                onClick={() => toast.info("System health is normal.")}
              >
                Test Toast
              </Button>
            }
          >
            <CardTitle>Shorten a New URL</CardTitle>
            <CardDescription>
              Enter an HTTP/HTTPS address to generate a solid short redirect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleShorten} className="flex flex-col sm:flex-row gap-3 items-start">
              <FormField
                id="url-input"
                placeholder="https://example.com/very/long/destination/url"
                icon="ri-global-line"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  if (urlError) setUrlError("");
                }}
                error={urlError}
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                icon="ri-magic-line"
                className="shrink-0 w-full sm:w-auto"
              >
                Shorten Link
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* 3. Composable Link List vs EmptyState Shell */}
        <Card>
          <CardHeader
            action={
              hasLinks ? (
                <Button
                  variant="destructive"
                  size="sm"
                  icon="ri-delete-bin-line"
                  onClick={handleDelete}
                >
                  Delete Link
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  icon="ri-refresh-line"
                  onClick={() => setHasLinks(true)}
                >
                  Restore Demo
                </Button>
              )
            }
          >
            <CardTitle>Recent Short Links</CardTitle>
            <CardDescription>Managed redirection keys and quick analytics</CardDescription>
          </CardHeader>
          <CardContent>
            {hasLinks ? (
              <div className="divide-y divide-border border border-border rounded overflow-hidden">
                <div className="p-3.5 bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        https://short.link/x9aB1
                      </span>
                      <Badge variant="success" size="sm">
                        Live
                      </Badge>
                    </div>
                    <p className="text-muted-foreground truncate max-w-md">
                      https://github.com/my-awesome-project/releases/v1.0.0-production-build
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-medium text-foreground mr-1">
                      1,420 clicks
                    </span>
                    <CopyButton text="https://short.link/x9aB1" />
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                icon="ri-link-unlink-m"
                title="No active links found"
                description="Shorten your first destination address above to track clicks and analytics."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    icon="ri-add-line"
                    onClick={() => setHasLinks(true)}
                  >
                    Create Link
                  </Button>
                }
              />
            )}
          </CardContent>
          <CardFooter>
            <span>Keyboard shortcuts enabled</span>
            <span className="flex items-center gap-1.5">
              Press <Kbd>Esc</Kbd> to dismiss popups
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
