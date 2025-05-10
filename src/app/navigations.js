import { authRoles } from "app/auth/authRoles";
import { usePlatformCapabilities } from "app/contexts/PlatformContext";

// Default navigations without conditional items
export const defaultNavigations = [
  { name: "Home", path: "/home", icon: "dashboard" },
  { label: "AIaaS", type: "label" },
  {
    name: "Projects",
    icon: "assignment",
    path: "/projects",
    children: [
      { name: "My Projects", iconText: "SI", path: "/projects/my" },
      { name: "List Projects", iconText: "SI", path: "/projects" },
      { name: "New Project", iconText: "SU", path: "/projects/new" },
    ]
  },
  {
    name: "Library",
    icon: "library_books",
    path: "/projects/library",
  },
  {
    name: "Teams",
    icon: "groups",
    path: "/teams",
    children: [
      { name: "Team List", iconText: "TL", path: "/teams" },
      { name: "New Team", iconText: "NT", path: "/teams/new", auth: authRoles.admin },
    ]
  },
  {
    name: "Users",
    icon: "person",
    path: "/users",
    auth: authRoles.admin,
    children: [
      { name: "User List", iconText: "SI", path: "/users", auth: authRoles.admin },
      { name: "New User", iconText: "SU", path: "/users/new", auth: authRoles.admin },
    ]
  },
  { label: "AI", type: "label" },
  {
    name: "LLMs",
    icon: "psychology",
    path: "/llms",
    children: [
      { name: "List LLMs", iconText: "SI", path: "/llms" },
      { name: "New LLM", iconText: "SU", path: "/llms/new", auth: authRoles.admin },
    ]
  },
  {
    name: "Embeddings",
    icon: "psychology",
    path: "/embeddings",
    children: [
      { name: "List Embeddings", iconText: "SI", path: "/embeddings" },
      { name: "New Embedding", iconText: "SU", path: "/embeddings/new", auth: authRoles.admin },
    ]
  },
  {
    name: "Tools",
    icon: "build",
    path: "/projects/tools",
  },
  { label: "Docs", type: "label" },
  {
    name: "API",
    icon: "launch",
    type: "extLink",
    path: "https://apocas.github.io/restai/api.html"
  },
  {
    name: "Swagger",
    icon: "launch",
    type: "extLink",
    path: "/docs/"
  }
];

// Dynamic items based on GPU capability
export const gpuDependentItems = {
  imageGen: {
    name: "Image Gen",
    icon: "image",
    path: "/image",
  },
  audioGen: {
    name: "Audio Gen",
    icon: "speaker",
    path: "/audio",
  },
  aiProxy: {
    name: "AI Proxy",
    icon: "route",
    path: "/proxy",
    auth: authRoles.admin,
    children: [
      { name: "API Keys", iconText: "SI", path: "/proxy/keys", auth: authRoles.admin },
      { name: "New Key", iconText: "SU", path: "/proxy/keys/new", auth: authRoles.admin },
    ]
  }
};

// Pure function to build navigation structure based on gpu capability
// This doesn't use any hooks
export const buildNavigations = (hasGpu) => {
  const navigations = [...defaultNavigations];
  
  // Insert GPU-dependent items before the Docs label
  const docsLabelIndex = navigations.findIndex(item => item.label === "Docs");
  const insertPosition = docsLabelIndex !== -1 ? docsLabelIndex : navigations.length;
  
  // Only show Image Gen if GPU is available
  if (hasGpu) {
    navigations.splice(insertPosition, 0, gpuDependentItems.imageGen);
  }

  // Only show Audio Gen if GPU is available
  if (hasGpu) {
    navigations.splice(insertPosition + (hasGpu ? 1 : 0), 0, gpuDependentItems.audioGen);
  }

  // Only show AI Proxy if GPU is available
  if (hasGpu) {
    navigations.splice(insertPosition + (hasGpu ? 2 : 0), 0, gpuDependentItems.aiProxy);
  }

  return navigations;
};

// Custom React hook that follows the rules of hooks
export const useNavigations = () => {
  const { platformCapabilities } = usePlatformCapabilities();
  const hasGpu = platformCapabilities?.gpu ?? false;
  return buildNavigations(hasGpu);
};

// For compatibility with direct imports (non-component files)
// This will not have dynamic GPU features but prevents errors
export const navigations = defaultNavigations;
