import Dexie, { type EntityTable } from "dexie";

export type TestRecord = {
  id: string;
  name: string;
  environment: string;
  data: Record<string, string>;
  description: string;
  createdAt: string;
  functional: string;
  relatedTask?: string; // Deprecated, kept for backward compatibility
  relatedTasks?: string[];
  layer: string;
  date: string;
  taskType?: string;
  state: 'passed' | 'failed' | 'unknown';
  failureReason: string;
};

export type Project = {
  id: string;
  name: string;
  environments: string[];
  data: Record<string, Record<string, string>>; // env -> { key: value }
  tests: TestRecord[];
  createdAt: string;
};

export type Settings = {
  id: string; // 'global'
  logo?: string; // base64
};

// We are using a single table 'projects' to store the full project tree for now
// to maintain compatibility with the existing nested JSON structure.
const db = new Dexie("TestGeneratorDB") as Dexie & {
  projects: EntityTable<Project, "id">;
  settings: EntityTable<Settings, "id">;
};

// Schema declaration:
db.version(1).stores({
  projects: "id, name, createdAt", // primary key "id"
  settings: "id", // Store global settings, id='global'
});

// Versión 2: Añadir atributo 'state' a los tests y migrar datos existentes
db.version(2).stores({
  projects: "id, name, createdAt",
  settings: "id"
}).upgrade(async (trans) => {
  const projects = await trans.table('projects').toArray();
  for (const project of projects) {
    if (Array.isArray(project.tests)) {
      project.tests = project.tests.map((test: any) => {
        if (typeof test.state === 'undefined') {
          return { ...test, state: 'unknown' };
        }
        return test;
      });
      await trans.table('projects').put(project);
    }
  }
});

// Versión 3: Añadir atributo 'failureReason' a los tests y migrar datos existentes
db.version(3).stores({
  projects: "id, name, createdAt",
  settings: "id"
}).upgrade(async (trans) => {
  const projects = await trans.table('projects').toArray();
  for (const project of projects) {
    if (Array.isArray(project.tests)) {
      project.tests = project.tests.map((test: any) => {
        if (typeof test.failureReason === 'undefined') {
          return { ...test, failureReason: "" };
        }
        return test;
      });
      await trans.table('projects').put(project);
    }
  }
});

export { db };
