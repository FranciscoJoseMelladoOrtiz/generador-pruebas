import { getProjects, createProject } from "@/lib/storage";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function Home() {
  const projects = await getProjects();

  async function handleCreateProject(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    if (name) {
      await createProject(name);
      revalidatePath("/");
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            Documentación de pruebas
          </h1>
          <p className="text-muted-foreground">
            Gestiona tus proyectos y genera evidencia de pruebas con facilidad.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* New Project Card */}
        <Card className="border-dashed border-2 border-muted hover:border-primary/50 transition-colors flex flex-col justify-center p-6 space-y-4">
          <CardHeader>
            <CardTitle>Crear proyecto</CardTitle>
            <CardDescription>
              Comienza documentando una nueva aplicación
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <form action={handleCreateProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="sr-only">
                  Nombre del proyecto
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nombre del proyecto"
                  required
                  className="bg-background"
                />
              </div>
              <Button type="submit" className="w-full">
                Crear proyecto
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Projects */}
        {projects.map((project) => (
          <Card
            key={project.id}
            className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
          >
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span className="truncate">{project.name}</span>
              </CardTitle>
              <CardDescription>
                Creado el {new Date(project.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex flex-col">
                  <span className="font-bold text-foreground">
                    {project.environments.length}
                  </span>
                  <span>Entornos</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-foreground">
                    {project.tests.length}
                  </span>
                  <span>Pruebas</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full variant-secondary">
                <Link href={`/projects/${project.id}`}>Ver detalles</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
