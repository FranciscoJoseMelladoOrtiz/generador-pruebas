import { ChipVariant, TestState as TestStateType } from "@/models/ui-models";
import { Chip } from "./Chip";
import { capitalize } from "@/utils/ui-utils";

type TestStateProps = {
    state?: TestStateType;
}

const stateVariantMap: Record<TestStateType, ChipVariant> = {
    'passed': 'success',
    'failed': 'danger',
    'unknown': 'secondary',
}

export function TestState({state = 'unknown'}: TestStateProps) {
    
    return (<Chip variant={stateVariantMap[state]}>{capitalize(state)}</Chip>)
}