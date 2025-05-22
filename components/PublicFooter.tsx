// components/Footer.tsx
export default function PublicFooter() {
  return (
    <footer className=" bg-violet-900">
      <div className="container mx-auto p-4 text-center text-sm text-white">
        &copy; {new Date().getFullYear()} Logistics Planet. All rights reserved.
      </div>
    </footer>
  );
}
