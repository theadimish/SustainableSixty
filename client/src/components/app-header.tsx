interface AppHeaderProps {
  title: string;
  icon?: string;
  showActions?: boolean;
}

export default function AppHeader({ title, icon = "eco", showActions = true }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <span className="material-icons text-primary mr-2">{icon}</span>
          <h1 className="font-heading font-bold text-xl text-primary">{title}</h1>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-3">
            <button className="text-neutral-medium hover:text-primary">
              <span className="material-icons">search</span>
            </button>
            <button className="text-neutral-medium hover:text-primary">
              <span className="material-icons">notifications</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
