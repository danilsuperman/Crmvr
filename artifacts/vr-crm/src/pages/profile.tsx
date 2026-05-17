export default function Profile() {
  return (
    <div className="flex flex-col h-full z-10">
      <header className="h-16 border-b border-border flex items-center px-6 justify-between bg-card/50 backdrop-blur-sm">
        <h1 className="text-xl font-bold font-mono">Profile</h1>
      </header>
      <div className="flex-1 p-6 overflow-auto">
        <div className="h-full border border-border rounded-lg bg-card/30 flex items-center justify-center">
          <p className="text-muted-foreground font-mono">PROFILE COMING SOON</p>
        </div>
      </div>
    </div>
  );
}
