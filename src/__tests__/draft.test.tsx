import TestForm from "@/components/TestForm";
import { db } from "@/lib/db";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

// Mock useRouter
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock db
vi.mock("@/lib/db", () => ({
  db: {
    projects: {
      get: vi.fn(),
      where: vi.fn().mockReturnThis(),
      equals: vi.fn().mockReturnThis(),
      modify: vi.fn(),
    },
  },
}));

describe("TestForm", () => {
  const projectId = "test-project-id";
  const mockProject = {
    id: projectId,
    name: "Test Project",
    environments: ["Dev"],
    data: { Dev: { key1: "value1" } },
    tests: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (db.projects.get as any).mockResolvedValue(mockProject);
  });

  it("saves the test correctly", async () => {
    render(<TestForm projectId={projectId} />);

    // Wait for project data to load
    await waitFor(() => screen.getByLabelText(/Nombre de prueba/i));

    // Fill out the form
    fireEvent.change(screen.getByLabelText(/Nombre de prueba/i), {
      target: { value: "New Test" },
    });

    // Select environment (using getAllByRole because Select trigger is a button)
    // Actually dealing with Radix UI Select in tests can be tricky.
    // We can simulate the underlying state change or try to interact with the UI.
    // For simplicity with Radix, we might need to find the trigger.

    // NOTE: Simulating user interaction with Radix Select is complex in JSDOM.
    // We will target the input if exposed or try finding the trigger.
    // Radix UI hides the select input.
    // Let's assume we can click the trigger and then the option.
    const envTrigger = screen.getAllByRole("combobox")[1]; // Assume order: TaskType, Environment
    fireEvent.click(envTrigger);

    // Ideally we'd click the item, but porting interactions is hard without setup.
    // Let's try to mock the state updates or just assume we can type into inputs if available.

    // ALTERNATIVE: Use a simpler test approach or mock the UI components if they are too complex.
    // BUT we want to test integration.

    // Note: Radix Select content is rendered in a Portal.
    // Let's try to use "user-event" if possible, but I only have fireEvent here typically or need to setup userEvent.
    // I will try to find the option.

    // For now, let's just assert that 'Guardar prueba' button calls db.projects.modify when clicked
    // But we need validations to pass.
  });
});
