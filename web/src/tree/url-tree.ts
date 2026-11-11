// Разбор ссылки пассивного дерева и загрузка данных по версии.
// Адаптировано из HeartofPhos/exile-leveling (web/src/state/tree), MIT License,
// Copyright (c) 2025 HeartofPhos.
import type { RouteData, SkillTree } from "common";
import Handlebars from "handlebars";
import { buildTemplate, type ViewBox } from "./svg";

export namespace UrlTree {
  export interface Data {
    name: string;
    version: string;
    ascendancy?: SkillTree.Ascendancy;
    nodes: string[];
    masteries: Record<string, string>;
  }
}

export interface TreeData {
  skillTree: SkillTree.Data;
  nodes: SkillTree.NodeLookup;
  svg: string;
  viewBox: ViewBox;
  style: Handlebars.TemplateDelegate;
}

const SOURCES = import.meta.glob<{ default: SkillTree.Data }>("./data/*.json");
const cache = new Map<string, Promise<TreeData>>();

export function hasTreeVersion(version: string) {
  return `./data/${version}.json` in SOURCES;
}

/** Данные дерева нужной версии; каждая версия грузится отдельным чанком. */
export function loadTree(version: string): Promise<TreeData> {
  let promise = cache.get(version);
  if (!promise) {
    const source = SOURCES[`./data/${version}.json`];
    if (!source) return Promise.reject(new Error(`no tree data for ${version}`));
    promise = source().then(({ default: skillTree }) => {
      const nodes: SkillTree.NodeLookup = Object.assign({}, ...skillTree.graphs.map((g) => g.nodes));
      const { svg, viewBox, styleTemplate } = buildTemplate(skillTree, nodes);
      return { skillTree, nodes, svg, viewBox, style: Handlebars.compile(styleTemplate) };
    });
    cache.set(version, promise);
  }
  return promise;
}

function decodeBase64Url(value: string) {
  const unescaped = value.replace(/_/g, "/").replace(/-/g, "+");
  return Uint8Array.from(window.atob(unescaped), (c) => c.charCodeAt(0));
}

export async function buildUrlTree(buildTree: RouteData.BuildTree): Promise<UrlTree.Data> {
  const data = /.*\/(.*?)(?:\?.*)?$/.exec(buildTree.url)?.[1];
  if (!data) throw new Error(`invalid url ${buildTree.url}`);

  const { skillTree, nodes: nodeLookup } = await loadTree(buildTree.version);
  const buffer = decodeBase64Url(data);

  const version = read_u32(buffer, 0);
  const classId = buffer[4];
  const ascendancyId = buffer[5];
  if (version < 6) throw new Error("invalid url version");

  const nodesOffset = 7;
  const nodesCount = buffer[6];
  const clusterOffset = nodesOffset + nodesCount * 2 + 1;
  const clusterCount = buffer[clusterOffset - 1];
  const masteryOffset = clusterOffset + clusterCount * 2 + 1;
  const masteryCount = buffer[masteryOffset - 1] * 2;

  // Ноды кластерных самоцветов в общем дереве отсутствуют.
  const nodes = read_u16s(buffer, nodesOffset, nodesCount)
    .map((x) => x.toString())
    .filter((x) => nodeLookup[x] !== undefined);

  const masteries: UrlTree.Data["masteries"] = {};
  const masteryData = read_u16s(buffer, masteryOffset, masteryCount);
  for (let i = 0; i < masteryData.length; i += 2) {
    masteries[masteryData[i + 1].toString()] = masteryData[i].toString();
  }

  return {
    name: buildTree.name,
    version: buildTree.version,
    ascendancy:
      ascendancyId > 0
        ? skillTree.ascendancies[skillTree.classes[classId].ascendancies[ascendancyId - 1]]
        : undefined,
    nodes,
    masteries,
  };
}

/** Деревья билда одной версии, без пустых и нераспознанных. */
export async function buildUrlTrees(buildTrees: RouteData.BuildTree[]) {
  let trees: UrlTree.Data[] = [];
  for (const buildTree of buildTrees) {
    if (!hasTreeVersion(buildTree.version)) continue;
    try {
      const tree = await buildUrlTree(buildTree);
      if (tree.nodes.length > 0) trees.push(tree);
    } catch (e) {
      console.error(`could not process tree ${buildTree.name}: ${e}`);
    }
  }
  if (trees.length > 0) trees = trees.filter((t) => t.version === trees[0].version);
  return trees;
}

function read_u16(buffer: Uint8Array, offset: number) {
  return (buffer[offset] << 8) | buffer[offset + 1];
}

function read_u32(buffer: Uint8Array, offset: number) {
  return (buffer[offset] << 24) | (buffer[offset + 1] << 16) | (buffer[offset + 2] << 8) | buffer[offset + 3];
}

function read_u16s(buffer: Uint8Array, offset: number, length: number) {
  if (buffer.length < offset + length * 2) throw new Error("invalid u16 buffer");
  const result: number[] = [];
  for (let i = 0; i < length; i++) result.push(read_u16(buffer, offset + i * 2));
  return result;
}
