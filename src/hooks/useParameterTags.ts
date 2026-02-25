import { useState, useCallback, useMemo } from "react";
import type { ParamItem } from "@/extensions/parameterTag";

interface UseParameterTagsReturn {
  params: ParamItem[];
  addParam: (key: string, value: string) => void;
  updateParam: (key: string, newValue: string) => void;
  removeParam: (key: string) => void;
  setParams: (params: ParamItem[]) => void;
  clearParams: () => void;
  hasParam: (key: string) => boolean;
  getParamValue: (key: string) => string | undefined;
}

/**
 * Convierte la configuración de datos del test en parámetros para TipTap.
 * Combina los datos del entorno seleccionados y los campos personalizados.
 * 
 * @param availableData - Datos configurados para el entorno (del proyecto)
 * @param selectedKeys - Keys de availableData que están seleccionadas
 * @param customData - Campos personalizados añadidos manualmente
 * @returns Array de parámetros para TipTap
 * 
 * @example
 * ```typescript
 * const params = convertTestDataToParams(
 *   { 'user': 'admin', 'password': '123' },
 *   new Set(['user']),
 *   [{ key: 'email', value: 'test@example.com' }]
 * );
 * // Resultado: [
 * //   { key: 'user', value: 'admin' },
 * //   { key: 'email', value: 'test@example.com' }
 * // ]
 * ```
 */
export function convertTestDataToParams(
  availableData: Record<string, string>,
  selectedKeys: Set<string>,
  customData: { key: string; value: string }[]
): ParamItem[] {
  const params: ParamItem[] = [];
  
  // Añadir datos del entorno seleccionados
  selectedKeys.forEach((key) => {
    if (availableData[key] !== undefined) {
      params.push({ key, value: availableData[key] });
    }
  });
  
  // Añadir campos personalizados (solo si tienen key)
  customData.forEach(({ key, value }) => {
    if (key.trim()) {
      params.push({ key, value });
    }
  });
  
  return params;
}

/**
 * Custom hook para gestionar parámetros del TipTap suggestion.
 * Proporciona funciones para añadir, actualizar, eliminar y consultar parámetros.
 * 
 * @param initialParams - Parámetros iniciales (opcional)
 * @returns Objeto con el estado de parámetros y funciones para gestionarlos
 * 
 * @example
 * ```typescript
 * const { params, addParam, updateParam, removeParam } = useParameterTags([
 *   { key: 'cliente', value: 'Pepe' },
 *   { key: 'ciudad', value: 'Córdoba' }
 * ]);
 * ```
 */
export function useParameterTags(initialParams: ParamItem[] = []): UseParameterTagsReturn {
  const [params, setParamsState] = useState<ParamItem[]>(initialParams);

  /**
   * Añade un nuevo parámetro. Si la key ya existe, actualiza su valor.
   */
  const addParam = useCallback((key: string, value: string) => {
    setParamsState((prevParams) => {
      const existingIndex = prevParams.findIndex((p) => p.key === key);
      
      if (existingIndex !== -1) {
        // Si ya existe, actualizar el valor
        const newParams = [...prevParams];
        newParams[existingIndex] = { key, value };
        return newParams;
      }
      
      // Si no existe, añadir al final
      return [...prevParams, { key, value }];
    });
  }, []);

  /**
   * Actualiza el valor de un parámetro existente por su key.
   */
  const updateParam = useCallback((key: string, newValue: string) => {
    setParamsState((prevParams) => {
      const existingIndex = prevParams.findIndex((p) => p.key === key);
      
      if (existingIndex === -1) {
        return prevParams; // No existe, no hacer nada
      }
      
      const newParams = [...prevParams];
      newParams[existingIndex] = { key, value: newValue };
      return newParams;
    });
  }, []);

  /**
   * Elimina un parámetro por su key.
   */
  const removeParam = useCallback((key: string) => {
    setParamsState((prevParams) => prevParams.filter((p) => p.key !== key));
  }, []);

  /**
   * Reemplaza todos los parámetros con un nuevo array.
   */
  const setParams = useCallback((newParams: ParamItem[]) => {
    setParamsState(newParams);
  }, []);

  /**
   * Limpia todos los parámetros.
   */
  const clearParams = useCallback(() => {
    setParamsState([]);
  }, []);

  /**
   * Verifica si existe un parámetro con la key especificada.
   */
  const hasParam = useCallback(
    (key: string): boolean => {
      return params.some((p) => p.key === key);
    },
    [params]
  );

  /**
   * Obtiene el valor de un parámetro por su key.
   */
  const getParamValue = useCallback(
    (key: string): string | undefined => {
      return params.find((p) => p.key === key)?.value;
    },
    [params]
  );

  return {
    params,
    addParam,
    updateParam,
    removeParam,
    setParams,
    clearParams,
    hasParam,
    getParamValue,
  };
}

/**
 * Custom hook para gestionar parámetros del TipTap basados en los datos del test.
 * Sincroniza automáticamente los datos del entorno seleccionados y campos personalizados.
 * 
 * @param availableData - Datos configurados para el entorno (del proyecto)
 * @param selectedKeys - Keys de availableData que están seleccionadas
 * @param customData - Campos personalizados añadidos manualmente
 * @returns Array de parámetros sincronizados para TipTap
 * 
 * @example
 * ```typescript
 * const params = useTestDataParams(availableData, selectedKeys, customData);
 * 
 * <TiptapEditor 
 *   content={content}
 *   onChange={setContent}
 *   params={params}
 * />
 * ```
 */
export function useTestDataParams(
  availableData: Record<string, string>,
  selectedKeys: Set<string>,
  customData: { key: string; value: string }[]
): ParamItem[] {
  // Convertir Set y customData a valores serializados para detectar cambios
  // React no detecta cambios en Sets o arrays por referencia, necesitamos valores primitivos
  const selectedKeysStr = Array.from(selectedKeys).sort().join(',');
  const customDataStr = JSON.stringify(customData);
  const availableDataStr = JSON.stringify(availableData);
  
  return useMemo(
    () => convertTestDataToParams(availableData, selectedKeys, customData),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [availableDataStr, selectedKeysStr, customDataStr]
  );
}
