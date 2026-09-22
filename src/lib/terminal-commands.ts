type OutputLineType =
  | "text"
  | "dim"
  | "error"
  | "heading"
  | "link"
  | "list"
  | "input"
  | "spacer";

type OutputLine = {
  type: OutputLineType;
  content?: string;
  href?: string;
  index?: string;
};

type WorkItem = {
  slug: string;
  title: string;
  description?: string;
  pubDate?: string;
};

type BlogItem = {
  slug: string;
  title: string;
  description?: string;
  pubDate?: string;
};

type TerminalData = {
  siteTitle?: string;
  siteUrl?: string;
  profile?: Record<string, unknown>;
  socials?: Record<string, unknown>;
  contact?: Record<string, unknown>;
  sections?: unknown;
  work?: WorkItem[];
  blog?: BlogItem[];
};

type CommandContext = {
  args: string[];
  raw: string;
  data: TerminalData;
  print: (lines: OutputLine | OutputLine[]) => void;
  execute: (input: string, echo?: boolean) => void;
};

type Command = {
  name: string;
  aliases?: string[];
  description: string;
  usage?: string;
  run: (context: CommandContext) => void;
};

let data: TerminalData = {};
let history: string[] = [];
let historyIndex = -1;

const terminalStartedAt = Date.now();

const line = (content = ""): OutputLine => ({
  type: "text",
  content,
});

const dim = (content = ""): OutputLine => ({
  type: "dim",
  content,
});

const heading = (content = ""): OutputLine => ({
  type: "heading",
  content,
});

const error = (content = ""): OutputLine => ({
  type: "error",
  content,
});

const link = (content: string, href: string): OutputLine => ({
  type: "link",
  content,
  href,
});

const list = (index: string, content: string): OutputLine => ({
  type: "list",
  index,
  content,
});

const spacer = (): OutputLine => ({
  type: "spacer",
});

function normalize(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function getSiteUrl(): string {
  return String(data.siteUrl ?? "").replace(/\/+$/, "");
}

function getSlug(item: WorkItem | BlogItem): string {
  return item.slug.replace(/^\/+|\/+$/g, "");
}

function getProfileValue(key: string): string {
  const profile = data.profile ?? {};
  const value = profile[key];

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}

function getObjectValue(
  object: Record<string, unknown> | undefined,
  key: string,
): unknown {
  if (!object) {
    return undefined;
  }

  if (object[key] !== undefined) {
    return object[key];
  }

  const matchingKey = Object.keys(object).find(
    (objectKey) => normalize(objectKey) === normalize(key),
  );

  return matchingKey ? object[matchingKey] : undefined;
}

function getSocialEntries(): Array<{
  key: string;
  label: string;
  url: string;
}> {
  const socials = data.socials;

  if (!socials) {
    return [];
  }

  return Object.entries(socials)
    .map(([key, value]) => {
      let url = "";
      let label = key;

      if (typeof value === "string") {
        url = value;
      } else if (value && typeof value === "object") {
        const object = value as Record<string, unknown>;

        if (typeof object.url === "string") {
          url = object.url;
        } else if (typeof object.href === "string") {
          url = object.href;
        }

        if (typeof object.label === "string") {
          label = object.label;
        } else if (typeof object.title === "string") {
          label = object.title;
        }
      }

      return {
        key,
        label,
        url,
      };
    })
    .filter((item) => item.url);
}

function formatDate(value?: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function findWork(query: string): WorkItem | undefined {
  const normalizedQuery = normalize(query);

  return (data.work ?? []).find(
    (item) =>
      normalize(item.slug) === normalizedQuery ||
      normalize(item.title) === normalizedQuery,
  );
}

function findBlog(query: string): BlogItem | undefined {
  const normalizedQuery = normalize(query);

  return (data.blog ?? []).find(
    (item) =>
      normalize(item.slug) === normalizedQuery ||
      normalize(item.title) === normalizedQuery,
  );
}

function parseInput(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quote = "";
  let escaped = false;

  for (const char of input.trim()) {
    if (escaped) {
      current += char;
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (quote) {
      if (char === quote) {
        quote = "";
      } else {
        current += char;
      }

      continue;
    }

    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }

    if (/\s/.test(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }

      continue;
    }

    current += char;
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

function getInternalUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.startsWith("/")) {
    return path;
  }

  return `/${path}`;
}

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

function renderOutput(
  container: HTMLElement,
  lines: OutputLine | OutputLine[],
): void {
  const items = Array.isArray(lines) ? lines : [lines];

  for (const item of items) {
    const element = document.createElement("div");

    element.className = `terminal-line ${item.type}`;

    if (item.type === "spacer") {
      element.setAttribute("aria-hidden", "true");
      element.style.height = "8px";
      container.appendChild(element);
      continue;
    }

    if (item.type === "link" && item.href) {
      const anchor = document.createElement("a");

      anchor.className = "terminal-link";
      anchor.href = item.href;
      anchor.textContent = item.content ?? "";

      if (isExternalUrl(item.href)) {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
      }

      element.appendChild(anchor);
    } else if (item.type === "list") {
      const wrapper = document.createElement("div");
      const index = document.createElement("span");
      const content = document.createElement("span");

      wrapper.className = "terminal-list";

      index.className = "terminal-list-index";
      index.textContent = item.index ?? "";

      content.className = "terminal-list-content";
      content.textContent = item.content ?? "";

      wrapper.append(index, content);
      element.appendChild(wrapper);
    } else {
      element.textContent = item.content ?? "";
    }

    container.appendChild(element);
  }

  container.scrollTop = container.scrollHeight;
}

function findCommand(commands: Command[], name: string): Command | undefined {
  const normalizedName = normalize(name);

  return commands.find(
    (command) =>
      normalize(command.name) === normalizedName ||
      command.aliases?.some((alias) => normalize(alias) === normalizedName),
  );
}

function commandHelp(commands: Command[], requested?: string): OutputLine[] {
  if (requested) {
    const command = findCommand(commands, requested);

    if (!command) {
      return [error(`help: command not found: ${requested}`)];
    }

    return [
      heading(command.name),
      line(command.description),
      ...(command.usage ? [dim(`usage: ${command.usage}`)] : []),
      ...(command.aliases?.length
        ? [dim(`aliases: ${command.aliases.join(", ")}`)]
        : []),
    ];
  }

  return [
    heading("available commands"),
    ...commands.map((command, index) =>
      list(
        String(index + 1).padStart(2, "0"),
        `${command.name.padEnd(12)} ${command.description}`,
      ),
    ),
    spacer(),
    dim("tip: use `help <command>` for details"),
  ];
}

function createCommands(): Command[] {
  return [
    {
      name: "help",
      aliases: ["?", "man"],
      description: "show available commands",
      usage: "help [command]",
      run: ({ args, print }) => {
        print(commandHelp(createCommands(), args[0]));
      },
    },

    {
      name: "about",
      description: "about Alva",
      run: ({ print }) => {
        const name =
          getProfileValue("name") || getProfileValue("fullName") || "Alva";

        const role =
          getProfileValue("role") ||
          getProfileValue("title") ||
          "builder / developer";

        const location = getProfileValue("location") || getProfileValue("city");

        const bio = getProfileValue("bio") || getProfileValue("description");

        const output: OutputLine[] = [heading(name), line(role)];

        if (location) {
          output.push(dim(location));
        }

        if (bio) {
          output.push(spacer(), line(bio));
        }

        output.push(
          spacer(),
          dim("This terminal is an alternate interface to the website."),
        );

        print(output);
      },
    },

    {
      name: "whoami",
      description: "show current identity",
      run: ({ print }) => {
        print(
          line(
            getProfileValue("name") || getProfileValue("fullName") || "alva",
          ),
        );
      },
    },

    {
      name: "date",
      description: "show current date and time",
      run: ({ print }) => {
        print(line(new Date().toString()));
      },
    },

    {
      name: "uptime",
      description: "show terminal session uptime",
      run: ({ print }) => {
        const elapsed = Date.now() - terminalStartedAt;
        const totalSeconds = Math.floor(elapsed / 1000);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const parts: string[] = [];

        if (hours > 0) {
          parts.push(`${hours}h`);
        }

        if (minutes > 0 || hours > 0) {
          parts.push(`${minutes}m`);
        }

        parts.push(`${seconds}s`);

        print(line(`session uptime: ${parts.join(" ")}`));
      },
    },

    {
      name: "pwd",
      description: "show current location",
      run: ({ print }) => {
        print(line("/home/alva"));
      },
    },

    {
      name: "ls",
      description: "list website sections",
      run: ({ print }) => {
        const sections = data.sections;

        if (Array.isArray(sections)) {
          print([
            heading("site"),
            ...sections.map((section, index) =>
              list(
                String(index + 1).padStart(2, "0"),
                typeof section === "string" ? section : JSON.stringify(section),
              ),
            ),
          ]);

          return;
        }

        print([
          heading("site"),
          list("01", "about"),
          list("02", "work"),
          list("03", "blog"),
          list("04", "contact"),
        ]);
      },
    },

    {
      name: "tree",
      description: "show website structure",
      run: ({ print }) => {
        print([
          heading("website"),
          line("├── /"),
          line("├── /about"),
          line("├── /work"),
          line("├── /blog"),
          line("├── /contact"),
          line("└── /terminal"),
        ]);
      },
    },

    {
      name: "projects",
      aliases: ["work"],
      description: "list or inspect projects",
      usage: "projects [list|show <project>]",
      run: ({ args, print }) => {
        const projects = data.work ?? [];
        const action = normalize(args[0]);

        if (!action || action === "list") {
          if (!projects.length) {
            print(dim("No projects found."));
            return;
          }

          print([
            heading("projects"),
            ...projects.map((project, index) =>
              list(String(index + 1).padStart(2, "0"), project.title),
            ),
          ]);

          return;
        }

        if (action === "show" || action === "view") {
          const query = args.slice(1).join(" ");

          if (!query) {
            print(error("usage: projects show <project>"));
            return;
          }

          const project = findWork(query);

          if (!project) {
            print(error(`project not found: ${query}`));
            return;
          }

          const url = `${getSiteUrl()}/work/${getSlug(project)}`;

          const output: OutputLine[] = [heading(project.title)];

          if (project.description) {
            output.push(line(project.description));
          }

          if (project.pubDate) {
            output.push(dim(formatDate(project.pubDate)));
          }

          output.push(spacer(), link(url, url));

          print(output);
          return;
        }

        const project = findWork(args.join(" "));

        if (project) {
          print([
            heading(project.title),
            ...(project.description ? [line(project.description)] : []),
            ...(project.pubDate ? [dim(formatDate(project.pubDate))] : []),
          ]);

          return;
        }

        print(error(`unknown projects option: ${args[0]}`));
      },
    },

    {
      name: "blog",
      description: "list or inspect blog posts",
      usage: "blog [list|read <post>]",
      run: ({ args, print }) => {
        const posts = data.blog ?? [];
        const action = normalize(args[0]);

        if (!action || action === "list") {
          if (!posts.length) {
            print(dim("No blog posts found."));
            return;
          }

          print([
            heading("blog"),
            ...posts.map((post, index) =>
              list(
                String(index + 1).padStart(2, "0"),
                `${post.title}${
                  post.pubDate ? `  ·  ${formatDate(post.pubDate)}` : ""
                }`,
              ),
            ),
          ]);

          return;
        }

        if (action === "read" || action === "view" || action === "show") {
          const query = args.slice(1).join(" ");

          if (!query) {
            print(error("usage: blog read <post>"));
            return;
          }

          const post = findBlog(query);

          if (!post) {
            print(error(`post not found: ${query}`));
            return;
          }

          const url = `${getSiteUrl()}/blog/${getSlug(post)}`;

          const output: OutputLine[] = [heading(post.title)];

          if (post.pubDate) {
            output.push(dim(formatDate(post.pubDate)));
          }

          if (post.description) {
            output.push(spacer(), line(post.description));
          }

          output.push(spacer(), link(url, url));

          print(output);
          return;
        }

        const post = findBlog(args.join(" "));

        if (post) {
          print([
            heading(post.title),
            ...(post.pubDate ? [dim(formatDate(post.pubDate))] : []),
            ...(post.description ? [spacer(), line(post.description)] : []),
          ]);

          return;
        }

        print(error(`unknown blog option: ${args[0]}`));
      },
    },

    {
      name: "search",
      aliases: ["find"],
      description: "search projects and blog posts",
      usage: "search <query>",
      run: ({ args, print }) => {
        const rawQuery = args.join(" ");
        const query = normalize(rawQuery);

        if (!query) {
          print(error("usage: search <query>"));
          return;
        }

        const projects = (data.work ?? []).filter(
          (project) =>
            normalize(project.title).includes(query) ||
            normalize(project.description).includes(query) ||
            normalize(project.slug).includes(query),
        );

        const posts = (data.blog ?? []).filter(
          (post) =>
            normalize(post.title).includes(query) ||
            normalize(post.description).includes(query) ||
            normalize(post.slug).includes(query),
        );

        if (!projects.length && !posts.length) {
          print(dim(`no results for "${rawQuery}"`));
          return;
        }

        const output: OutputLine[] = [heading(`search: ${rawQuery}`)];

        if (projects.length) {
          output.push(line("projects"));

          projects.forEach((project, index) => {
            output.push(
              list(
                String(index + 1).padStart(2, "0"),
                `project  ${project.title}`,
              ),
            );
          });
        }

        if (posts.length) {
          output.push(spacer(), line("blog"));

          posts.forEach((post, index) => {
            output.push(
              list(
                String(index + 1).padStart(2, "0"),
                `post     ${post.title}`,
              ),
            );
          });
        }

        print(output);
      },
    },

    {
      name: "socials",
      aliases: ["social"],
      description: "show social links",
      run: ({ print }) => {
        const socials = getSocialEntries();

        if (!socials.length) {
          print(dim("No social links configured."));
          return;
        }

        print([
          heading("socials"),
          ...socials.map((social, index) =>
            list(
              String(index + 1).padStart(2, "0"),
              `${social.label}  ${social.url}`,
            ),
          ),
        ]);
      },
    },

    {
      name: "contact",
      description: "show contact information",
      run: ({ print }) => {
        const contact = data.contact;

        if (!contact) {
          print(dim("No contact information configured."));
          return;
        }

        const entries = Object.entries(contact).filter(
          ([, value]) => typeof value === "string" || typeof value === "number",
        );

        if (!entries.length) {
          print(dim("No contact information configured."));
          return;
        }

        print([
          heading("contact"),
          ...entries.map(([key, value], index) =>
            list(
              String(index + 1).padStart(2, "0"),
              `${key}: ${String(value)}`,
            ),
          ),
        ]);
      },
    },

    {
      name: "stack",
      aliases: ["tech", "skills"],
      description: "show technology stack",
      run: ({ print }) => {
        const stack =
          getProfileValue("stack") ||
          getProfileValue("technologies") ||
          getProfileValue("skills");

        if (stack) {
          print([heading("stack"), line(stack)]);
          return;
        }

        print([
          heading("stack"),
          list("01", "TypeScript"),
          list("02", "React"),
          list("03", "Astro"),
          list("04", "Laravel"),
          list("05", "PostgreSQL"),
          list("06", "Tailwind CSS"),
        ]);
      },
    },

    {
      name: "resume",
      aliases: ["cv"],
      description: "open resume",
      run: ({ print }) => {
        const resumeUrl = getObjectValue(data.contact, "resume");

        if (typeof resumeUrl !== "string" || !resumeUrl) {
          print(error("resume URL is not configured."));
          return;
        }

        print(link("open resume", resumeUrl));

        window.open(resumeUrl, "_blank", "noopener,noreferrer");
      },
    },

    {
      name: "cat",
      aliases: ["read"],
      description: "read a profile field",
      usage: "cat <field>",
      run: ({ args, print }) => {
        const key = args.join(" ");

        if (!key) {
          print(error("usage: cat <field>"));
          return;
        }

        const value = getObjectValue(data.profile, key);

        if (value === undefined) {
          print(error(`cat: ${key}: not found`));
          return;
        }

        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          print(line(String(value)));
          return;
        }

        print(line(JSON.stringify(value, null, 2)));
      },
    },

    {
      name: "env",
      description: "show public site configuration",
      run: ({ print }) => {
        print([
          heading("environment"),
          list("01", `SITE_TITLE=${data.siteTitle ?? ""}`),
          list("02", `SITE_URL=${data.siteUrl ?? ""}`),
          list("03", `PROJECTS=${data.work?.length ?? 0}`),
          list("04", `POSTS=${data.blog?.length ?? 0}`),
        ]);
      },
    },

    //{
    //  name: "uname",
    //  aliases: ["system"],
    //  description: "show system information",
    //  usage: "uname [-a]",
    //  run: ({ args, print }) => {
    //    if (args.includes("-a")) {
    //      print(
    //        line("AlvaOS web-terminal 1.0.0 browser/x64 TypeScript/JavaScript"),
    //      );
    //      return;
    //    }

    //    print(line("AlvaOS"));
    //  },
    //},

    {
      name: "neofetch",
      description: "show system summary",
      run: ({ print }) => {
        const name =
          getProfileValue("name") || getProfileValue("fullName") || "Alva";

        print([
          heading("alva"),
          line("────────────────────────────"),
          list("01", `user       ${name}`),
          list("02", "shell      web-terminal"),
          list("03", "runtime    browser"),
          list("04", "framework  Astro"),
          list("05", "language   TypeScript"),
          list("06", `projects   ${data.work?.length ?? 0}`),
          list("07", `posts      ${data.blog?.length ?? 0}`),
          list("08", `url        ${getSiteUrl()}`),
          line("────────────────────────────"),
        ]);
      },
    },

    {
      name: "history",
      description: "show command history",
      run: ({ print }) => {
        if (!history.length) {
          print(dim("history is empty"));
          return;
        }

        print(
          history
            .slice()
            .reverse()
            .map((command, index) =>
              list(String(index + 1).padStart(2, "0"), command),
            ),
        );
      },
    },

    {
      name: "echo",
      description: "print text",
      usage: "echo <text>",
      run: ({ args, print }) => {
        print(line(args.join(" ")));
      },
    },

    {
      name: "open",
      description: "open a URL or website route",
      usage: "open <url|path>",
      run: ({ args, print }) => {
        const target = args.join(" ");

        if (!target) {
          print(error("usage: open <url|path>"));
          return;
        }

        const url = getInternalUrl(target);

        print(dim(`opening ${url}`));

        window.location.href = url;
      },
    },

    {
      name: "goto",
      aliases: ["cd"],
      description: "navigate to a website section",
      usage: "goto <path>",
      run: ({ args, print }) => {
        const target = args.join(" ");

        if (!target) {
          print(error("usage: goto <path>"));
          return;
        }

        const url = getInternalUrl(target);

        print(dim(`navigating to ${url}`));

        window.location.href = url;
      },
    },

    {
      name: "home",
      aliases: ["~"],
      description: "return to homepage",
      run: ({ print }) => {
        print(dim("returning home..."));

        window.location.href = "/";
      },
    },

    {
      name: "clear",
      aliases: ["cls"],
      description: "clear terminal",
      run: () => {},
    },

    {
      name: "exit",
      description: "return to the main website",
      run: ({ print }) => {
        print(dim("returning to website..."));

        window.location.href = "/";
      },
    },
  ];
}

function getCommandSuggestions(commands: Command[], input: string): string[] {
  const normalizedInput = normalize(input);

  if (!normalizedInput) {
    return commands.map((command) => command.name);
  }

  return commands
    .map((command) => command.name)
    .filter((name) => normalize(name).startsWith(normalizedInput));
}

function autocomplete(input: HTMLInputElement, commands: Command[]): void {
  const value = input.value;

  if (value.includes(" ")) {
    return;
  }

  const suggestions = getCommandSuggestions(commands, value);

  if (suggestions.length === 1) {
    input.value = `${suggestions[0]} `;
    return;
  }

  if (suggestions.length > 1) {
    const output = document.getElementById("terminal-output");

    if (!output) {
      return;
    }

    renderOutput(output, dim(suggestions.join("    ")));
  }
}

export function initTerminal(terminalData: TerminalData): void {
  data = terminalData;

  const output = document.getElementById("terminal-output");

  const input = document.getElementById(
    "terminal-input",
  ) as HTMLInputElement | null;

  if (!output || !input) {
    return;
  }

  const commands = createCommands();

  const print = (lines: OutputLine | OutputLine[]): void => {
    renderOutput(output, lines);
  };

  const welcome: OutputLine[] = [
    heading("TERMINAL"),
    spacer(),
    line("Welcome. Type `help` to see available commands."),
  ];

  print(welcome);

  const execute = (rawInput: string, echo = true): void => {
    const raw = rawInput.trim();

    if (!raw) {
      return;
    }

    if (echo) {
      print({
        type: "input",
        content: `alva@web:~$ ${raw}`,
      });
    }

    history = history.filter((item) => item !== raw);

    history.push(raw);

    if (history.length > 50) {
      history.shift();
    }

    historyIndex = -1;

    const tokens = parseInput(raw);
    const commandName = tokens.shift() ?? "";

    const command = findCommand(commands, commandName);

    if (!command) {
      const suggestions = getCommandSuggestions(commands, commandName);

      const outputLines: OutputLine[] = [
        error(`command not found: ${commandName}`),
      ];

      if (suggestions.length) {
        outputLines.push(
          dim(
            `did you mean: ${suggestions
              .map((item) => `\`${item}\``)
              .join(", ")}`,
          ),
        );
      }

      print(outputLines);
      return;
    }

    if (command.name === "clear") {
      output.innerHTML = "";
      return;
    }

    command.run({
      args: tokens,
      raw,
      data,
      print,
      execute,
    });
  };

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const value = input.value;

      input.value = "";

      execute(value);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      if (!history.length) {
        return;
      }

      if (historyIndex === -1) {
        historyIndex = history.length - 1;
      } else if (historyIndex > 0) {
        historyIndex -= 1;
      }

      input.value = history[historyIndex] ?? "";

      requestAnimationFrame(() => {
        input.setSelectionRange(input.value.length, input.value.length);
      });

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      if (!history.length) {
        return;
      }

      if (historyIndex === -1) {
        return;
      }

      if (historyIndex < history.length - 1) {
        historyIndex += 1;
        input.value = history[historyIndex] ?? "";
      } else {
        historyIndex = -1;
        input.value = "";
      }

      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();

      autocomplete(input, commands);

      return;
    }

    if (event.key.toLowerCase() === "l" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();

      output.innerHTML = "";
      return;
    }

    if (event.key.toLowerCase() === "c" && event.ctrlKey) {
      event.preventDefault();

      if (input.value) {
        print({
          type: "input",
          content: `alva@web:~$ ${input.value}^C`,
        });
      }

      input.value = "";
      historyIndex = -1;
    }
  });

  document.addEventListener("click", () => {
    input.focus();
  });

  input.focus();
}
