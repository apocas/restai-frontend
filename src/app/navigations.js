import { authRoles } from "app/auth/authRoles";

export const navigations = [
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
  {
    name: "Image Gen",
    icon: "image",
    path: "/image",
  },
  {
    name: "Audio Gen",
    icon: "speaker",
    path: "/audio",
  },
  {
    name: "Proxy",
    icon: "psychology",
    path: "/proxy",
    auth: authRoles.admin,
    children: [
      { name: "API Keys", iconText: "SI", path: "/proxy/keys", auth: authRoles.admin },
      { name: "New Key", iconText: "SU", path: "/proxy/keys/new", auth: authRoles.admin },
    ]
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
