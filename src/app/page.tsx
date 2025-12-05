import { getProjects, createProject } from '@/lib/storage';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export default async function Home() {
  const projects = await getProjects();

  async function handleCreateProject(formData: FormData) {
    'use server'
    const name = formData.get('name') as string;
    if (name) {
      await createProject(name);
      revalidatePath('/');
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Test Documentation</h1>
          <p className="text-muted-foreground">Manage your projects and generate test evidence with ease.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* New Project Card */}
        <Card className="border-dashed border-2 border-muted hover:border-primary/50 transition-colors flex flex-col justify-center items-center p-6 space-y-4">
          <CardHeader className="text-center p-0">
            <CardTitle>Create Project</CardTitle>
            <CardDescription>Start documenting a new application</CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <form action={handleCreateProject} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="sr-only">Project Name</Label>
                <Input id="name" name="name" placeholder="Project Name" required className="bg-background" />
              </div>
              <Button type="submit" className="w-full">Create Project</Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Projects */}
        {projects.map((project) => (
          <Card key={project.id} className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span className="truncate">{project.name}</span>
              </CardTitle>
              <CardDescription>
                Created {new Date(project.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div className="flex flex-col">
                  <span className="font-bold text-foreground">{project.environments.length}</span>
                  <span>Envs</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-foreground">{project.tests.length}</span>
                  <span>Tests</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full variant-secondary">
                <Link href={`/projects/${project.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
