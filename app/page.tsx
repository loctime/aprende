import Link from 'next/link'

export default function HomePage() {
  return (
    <section className="py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
        Aprende mejor con video <span className="text-brand">+ material</span>.
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-ink-dim">
        Tomamos los mejores cursos públicos y los enriquecemos con ejercicios, ejemplos y diagramas
        originales — todo en una página.
      </p>
      <div className="mt-8">
        <Link
          href="/cursos"
          className="inline-block rounded-lg bg-brand px-6 py-3 text-white shadow hover:bg-brand-soft"
        >
          Ver cursos
        </Link>
      </div>
    </section>
  )
}
