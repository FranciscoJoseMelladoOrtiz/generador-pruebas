"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import TiptapEditor from "@/components/TiptapEditor";
import { db, Project, TestRecord } from "@/lib/db";
import { useReactToPrint } from "react-to-print";
import { Printer, Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { TestPrintTemplate } from "@/components/TestPrintTemplate";
import { TestState } from "@/models/ui-models";
import { useTestState } from "@/hooks/testState.hooks";

type Props = {
  projectId: string;
  testId?: string; // If present, edit mode
};

export default function TestForm({ projectId, testId }: Props) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [test, setTest] = useState<TestRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState("");
  const { status: testStatus, failureReason, setStatus, setFailureReason } = useTestState();
  const [functional, setFunctional] = useState("");
  const [relatedTasks, setRelatedTasks] = useState<string[]>([]);
  const [layer, setLayer] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [descriptionHtml, setDescriptionHtml] = useState("");
  const [taskType, setTaskType] = useState("Defecto");
  const [customTaskType, setCustomTaskType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data Management
  const [availableData, setAvailableData] = useState<Record<string, string>>(
    {}
  );
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [customData, setCustomData] = useState<
    { key: string; value: string }[]
  >([]);

  // Derived state for printing
  const printTestRecord = useMemo<TestRecord>(() => {
    // Merge data
    const finalData: Record<string, string> = {};
    selectedKeys.forEach((k) => {
      finalData[k] = availableData[k];
    });
    customData.forEach(({ key, value }) => {
      if (key) finalData[key] = value;
    });

    return {
      id: testId || "preview",
      name: name,
      environment: environment,
      data: finalData,
      description: descriptionHtml,
      functional: functional,
      relatedTasks: relatedTasks,
      relatedTask: relatedTasks[0] || "", // maintain backward compat
      layer: layer,
      date: date,
      taskType: taskType === "Otros" ? customTaskType : taskType,
      createdAt: test?.createdAt || new Date().toISOString(),
      state: testStatus,
      failureReason: failureReason,
    };
  }, [
    testId,
    name,
    environment,
    availableData,
    selectedKeys,
    customData,
    descriptionHtml,
    functional,
    relatedTasks,
    layer,
    date,
    taskType,
    customTaskType,
    test,
    testStatus,
    failureReason,
  ]);

  // Ref for printing
  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: relatedTasks?.[0]
      ? `${name} - ${relatedTasks[0].split("/").pop()}`
      : name || "Test Record",
  });

  useEffect(() => {
    async function loadData() {
      // Using db.projects.get instead of storage getProject
      const p = await db.projects.get(projectId);
      setProject(p || null);

      if (testId && p) {
        const t = p.tests.find((t) => t.id === testId);
        if (t) {
          setTest(t);
          setName(t.name || "");
          setEnvironment(t.environment);
          setFunctional(t.functional || "");
          setRelatedTasks(
            t.relatedTasks || (t.relatedTask ? [t.relatedTask] : [])
          );
          setStatus(t.state || "unknown");
          setFailureReason(t.failureReason || "");
          setLayer(t.layer || "");
          setDate(t.date || new Date().toISOString().split("T")[0]);
          setLayer(t.layer || "");
          setDate(t.date || new Date().toISOString().split("T")[0]);
          setDescriptionHtml(t.description);

          const tType = t.taskType || "Defecto";
          if (["Defecto", "Evolutivo", "Caso de uso"].includes(tType)) {
            setTaskType(tType);
            setCustomTaskType("");
          } else {
            setTaskType("Otros");
            setCustomTaskType(tType);
          }

          // Reconstruct data state
          const envData = p.data[t.environment] || {};
          setAvailableData(envData);

          const initialSelected = new Set<string>();
          const initialCustom: { key: string; value: string }[] = [];

          Object.entries(t.data).forEach(([k, v]) => {
            if (envData[k] === v) {
              initialSelected.add(k);
            } else {
              initialCustom.push({ key: k, value: v });
            }
          });

          setSelectedKeys(initialSelected);
          setCustomData(initialCustom);
        }
      }
      setLoading(false);
    }
    loadData();
  }, [projectId, testId]);

  // Handle Environment Change logic
  useEffect(() => {
    if (!testId && project && environment) {
      const envData = project.data[environment] || {};
      setAvailableData(envData);
      // Default select all
      setSelectedKeys(new Set(Object.keys(envData)));
      setCustomData([]);
    }
  }, [environment, project, testId]);

  const toggleKey = (key: string) => {
    const next = new Set(selectedKeys);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelectedKeys(next);
  };

  const addCustomRow = () => {
    setCustomData([...customData, { key: "", value: "" }]);
  };

  const updateCustomRow = (
    index: number,
    field: "key" | "value",
    val: string
  ) => {
    const next = [...customData];
    next[index][field] = val;
    setCustomData(next);
  };

  const removeCustomRow = (index: number) => {
    setCustomData(customData.filter((_, i) => i !== index));
  };

  const addRelatedTask = () => {
    setRelatedTasks([...relatedTasks, ""]);
  };

  const updateRelatedTask = (index: number, value: string) => {
    const newTasks = [...relatedTasks];
    newTasks[index] = value;
    setRelatedTasks(newTasks);
  };

  const removeRelatedTask = (index: number) => {
    setRelatedTasks(relatedTasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !environment || !name) return;

    setIsSubmitting(true);

    try {
      await db.projects
        .where("id")
        .equals(projectId)
        .modify((p) => {
          // Use the derived object logic if possible, or just rebuild it to be safe/explicit for DB
          // Re-using printTestRecord logic here essentially
          if (testId) {
            const idx = p.tests.findIndex((t) => t.id === testId);
            if (idx !== -1) {
              p.tests[idx] = {
                ...p.tests[idx], // keep original props
                ...printTestRecord, // overwrite with current state
                id: testId, // ensure ID matches
                createdAt: p.tests[idx].createdAt, // keep created at
              };
            }
          } else {
            const newTest: TestRecord = {
              ...printTestRecord,
              id: uuidv4(),
            };
            p.tests.unshift(newTest);
          }
        });

      setIsSubmitting(false);
      router.push(`/projects/${projectId}`);
      // router.refresh(); // Not strictly needed with Dexie liveQuery but safe to leave
    } catch (error) {
      console.error("Failed to save test:", error);
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!project)
    return <div className="p-10 text-center">Project not found</div>;
  if (testId && !test)
    return <div className="p-10 text-center">Test not found</div>;

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          onClick={() => router.push(`/projects/${projectId}`)}
        >
          &larr; Volver
        </Button>
        <Button
          onClick={() => handlePrint && handlePrint()}
          variant="secondary"
        >
          <Printer className="w-4 h-4 mr-2" /> Export PDF
        </Button>
      </div>

      <div className="">
        <Card className="">
          <CardHeader className="">
            <CardTitle>{testId ? "Editar Prueba" : "Nueva Prueba"}</CardTitle>
            <CardDescription>
              {testId
                ? `Editando Prueba: ${test?.id}`
                : `Documentando para ${project.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="testName">Nombre de prueba:</Label>
                <div className="relative">
                  <Input
                    id="testName"
                    placeholder="e.g. User Login Validation"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de tarea:</Label>
                  <Select value={taskType} onValueChange={setTaskType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Defecto">Defecto</SelectItem>
                      <SelectItem value="Evolutivo">Evolutivo</SelectItem>
                      <SelectItem value="Caso de uso">Caso de uso</SelectItem>
                      <SelectItem value="Otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                  {taskType === "Otros" && (
                    <Input
                      placeholder="Especificar tipo..."
                      value={customTaskType}
                      onChange={(e) => setCustomTaskType(e.target.value)}
                      className="mt-2"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Entorno:</Label>
                  <Select
                    onValueChange={setEnvironment}
                    value={environment}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona entorno" />
                    </SelectTrigger>
                    <SelectContent>
                      {project.environments.map((env) => (
                        <SelectItem key={env} value={env}>
                          {env}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="layer">Capa:</Label>
                  <Input
                    id="layer"
                    placeholder="front, mw, host..."
                    value={layer}
                    onChange={(e) => setLayer(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Fecha:</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="functional">Funcional:</Label>
                  <Input
                    id="functional"
                    placeholder="Tester Name"
                    value={functional}
                    onChange={(e) => setFunctional(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="functional">Estado:</Label>
                  <Select
                    onValueChange={v => setStatus(v as TestState || "unknown")}
                    value={testStatus}
                    defaultValue='unknown'
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona entorno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key='passed' value='passed'>
                        Passed
                      </SelectItem>
                      <SelectItem key='failed' value='failed'>
                        Failed
                      </SelectItem>
                      <SelectItem key='unknown' value='unknown'>
                        Ignore
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {testStatus === 'failed' && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Razon del error</Label>
                  </div>
                  <Input
                    placeholder="Tarea relacionada"
                    value={failureReason}
                    onChange={(e) => setFailureReason(e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Tareas Relacionadas</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addRelatedTask}
                    className="h-7 w-7 p-0 rounded-full"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {relatedTasks.map((task, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="Tarea relacionada"
                      value={task}
                      onChange={(e) => updateRelatedTask(index, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRelatedTask(index)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {relatedTasks.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No hay tareas relacionadas.
                  </p>
                )}
              </div>

              {environment && (
                <div className="border rounded-md p-4 space-y-4">
                  <Label>Configuración de datos</Label>

                  {/* Environment Data Selection */}
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase text-muted-foreground font-bold">
                      Datos ({environment})
                    </h4>
                    {Object.keys(availableData).length === 0 && (
                      <p className="text-sm text-muted-foreground italic">
                        No hay datos configurados para este entorno.
                      </p>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(availableData).map(([key, value]) => (
                        <div
                          key={key}
                          className={`${
                            selectedKeys.has(key) ? "checked" : ""
                          } flex items-center space-x-2 p-1 hover:bg-muted/50`}
                        >
                          <Checkbox
                            id={`env-key-${key}`}
                            checked={selectedKeys.has(key)}
                            onCheckedChange={() => toggleKey(key)}
                          />
                          <div className="grid gap-0.5 leading-none">
                            <Label
                              htmlFor={`env-key-${key}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {key}
                            </Label>
                            <span className="text-xs text-muted-foreground font-mono">
                              {value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Data Section */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs uppercase text-muted-foreground font-bold">
                        Campos personalizados
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCustomRow}
                        className="h-7 w-7 p-0 rounded-full"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {customData.map((row, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <Input
                          placeholder="Campo"
                          value={row.key}
                          onChange={(e) =>
                            updateCustomRow(idx, "key", e.target.value)
                          }
                          className="h-8 text-xs font-mono"
                        />
                        <Input
                          placeholder="Valor"
                          value={row.value}
                          onChange={(e) =>
                            updateCustomRow(idx, "value", e.target.value)
                          }
                          className="h-8 text-xs font-mono"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomRow(idx)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {customData.length === 0 && (
                      <p className="text-sm text-muted-foreground italic">
                        No campos personalizados agregados.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Descripción y evidencias</Label>
                <div>
                  <TiptapEditor
                    content={descriptionHtml}
                    onChange={setDescriptionHtml}
                    placeholder="Describe the test steps, expected results, and paste any evidence..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="submit"
                  disabled={isSubmitting || !environment || !name}
                >
                  {isSubmitting ? "Guardando..." : "Guardar prueba"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Hidden print template */}
      <div className="hidden">
        <div ref={printRef}>
          <TestPrintTemplate
            test={printTestRecord}
            projectName={project.name}
          />
        </div>
      </div>
    </div>
  );
}
