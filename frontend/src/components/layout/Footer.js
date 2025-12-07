export default function Footer() {
    return (
        <footer className="w-full bg-gray-100 text-gray-500 py-4 mt-auto shadow-inner">
            <div className="max-w-7xl mx-auto px-4 flex justify-center">
                <p className="text-sm text-center">Desenvolvido por <span className="font-bold">Thiago Pecorari Clemente</span> | {new Date().getFullYear()} MAX IMÓVEIS </p>
            </div>
        </footer>
    );
}
