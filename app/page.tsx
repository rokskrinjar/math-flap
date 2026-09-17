export default function Home() {
  return (
    <main className="fixed inset-0 overflow-hidden bg-[#071a3d]">
      <iframe
        className="h-full w-full border-0"
        src="/game.html"
        title="Math Flap game"
        allow="autoplay"
      />
    </main>
  );
}
