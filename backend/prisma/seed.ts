import { prisma } from "../src/config/prisma.js";
import { hashPassword } from "../src/utils/hash.js";

async function main() {
  console.log("Seeding database...");

  const passwordHash = await hashPassword("password123");

  const admin = await prisma.user.create({
    data: { name: "Admin User", email: "admin@pulseboard.dev", passwordHash, role: "ADMIN" },
  });

  const pm1 = await prisma.user.create({
    data: { name: "Priya Sharma", email: "pm1@pulseboard.dev", passwordHash, role: "PM" },
  });
  const pm2 = await prisma.user.create({
    data: { name: "Rahul Verma", email: "pm2@pulseboard.dev", passwordHash, role: "PM" },
  });

  const dev1 = await prisma.user.create({
    data: { name: "Ravi Kumar", email: "dev1@pulseboard.dev", passwordHash, role: "DEVELOPER" },
  });
  const dev2 = await prisma.user.create({
    data: { name: "Anita Singh", email: "dev2@pulseboard.dev", passwordHash, role: "DEVELOPER" },
  });
  const dev3 = await prisma.user.create({
    data: { name: "Karan Mehta", email: "dev3@pulseboard.dev", passwordHash, role: "DEVELOPER" },
  });
  const dev4 = await prisma.user.create({
    data: { name: "Sneha Patel", email: "dev4@pulseboard.dev", passwordHash, role: "DEVELOPER" },
  });

  const clientAcme = await prisma.client.create({ data: { name: "Acme Corp", email: "contact@acme.com" } });
  const clientGlobex = await prisma.client.create({ data: { name: "Globex Inc", email: "contact@globex.com" } });
  const clientInitech = await prisma.client.create({ data: { name: "Initech", email: "contact@initech.com" } });

  const projectWebsite = await prisma.project.create({
    data: {
      name: "Website Revamp",
      description: "Redesign of the public marketing site",
      clientId: clientAcme.id,
      createdById: pm1.id,
    },
  });

  const projectMobile = await prisma.project.create({
    data: {
      name: "Mobile App Launch",
      description: "iOS and Android app for order tracking",
      clientId: clientGlobex.id,
      createdById: pm1.id,
    },
  });

  const projectTooling = await prisma.project.create({
    data: {
      name: "Internal Tooling",
      description: "Internal admin dashboard revamp",
      clientId: clientInitech.id,
      createdById: pm2.id,
    },
  });

  const now = Date.now();
  const daysFromNow = (n: number) => new Date(now + n * 24 * 60 * 60 * 1000);

  // Project 1: Website Revamp — 5 tasks, 2 overdue
  const t1 = await prisma.task.create({
    data: {
      projectId: projectWebsite.id,
      title: "Design homepage mockup",
      description: "Create Figma mockups for the new homepage",
      assignedToId: dev1.id,
      status: "DONE",
      priority: "MEDIUM",
      dueDate: daysFromNow(-5),
    },
  });
  const t2 = await prisma.task.create({
    data: {
      projectId: projectWebsite.id,
      title: "Build responsive navbar",
      assignedToId: dev1.id,
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: daysFromNow(3),
    },
  });
  const t3 = await prisma.task.create({
    data: {
      projectId: projectWebsite.id,
      title: "Integrate CMS for blog",
      assignedToId: dev2.id,
      status: "IN_REVIEW",
      priority: "MEDIUM",
      dueDate: daysFromNow(1),
    },
  });
  const t4 = await prisma.task.create({
    data: {
      projectId: projectWebsite.id,
      title: "Fix cross-browser CSS bugs",
      assignedToId: dev2.id,
      status: "TODO",
      priority: "LOW",
      dueDate: daysFromNow(-2),
      isOverdue: true,
    },
  });
  const t5 = await prisma.task.create({
    data: {
      projectId: projectWebsite.id,
      title: "Set up analytics tracking",
      assignedToId: dev1.id,
      status: "TODO",
      priority: "CRITICAL",
      dueDate: daysFromNow(-1),
      isOverdue: true,
    },
  });

  // Project 2: Mobile App Launch — 5 tasks
  const t6 = await prisma.task.create({
    data: {
      projectId: projectMobile.id,
      title: "Set up React Native project",
      assignedToId: dev3.id,
      status: "DONE",
      priority: "HIGH",
      dueDate: daysFromNow(-10),
    },
  });
  const t7 = await prisma.task.create({
    data: {
      projectId: projectMobile.id,
      title: "Implement push notifications",
      assignedToId: dev3.id,
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: daysFromNow(4),
    },
  });
  const t8 = await prisma.task.create({
    data: {
      projectId: projectMobile.id,
      title: "Build order tracking screen",
      assignedToId: dev4.id,
      status: "TODO",
      priority: "MEDIUM",
      dueDate: daysFromNow(6),
    },
  });
  const t9 = await prisma.task.create({
    data: {
      projectId: projectMobile.id,
      title: "App store submission checklist",
      assignedToId: dev4.id,
      status: "TODO",
      priority: "LOW",
      dueDate: daysFromNow(10),
    },
  });
  const t10 = await prisma.task.create({
    data: {
      projectId: projectMobile.id,
      title: "QA regression pass",
      assignedToId: dev3.id,
      status: "IN_REVIEW",
      priority: "CRITICAL",
      dueDate: daysFromNow(2),
    },
  });

  // Project 3: Internal Tooling — 5 tasks
  const t11 = await prisma.task.create({
    data: {
      projectId: projectTooling.id,
      title: "Audit existing admin permissions",
      assignedToId: dev2.id,
      status: "DONE",
      priority: "MEDIUM",
      dueDate: daysFromNow(-7),
    },
  });
  const t12 = await prisma.task.create({
    data: {
      projectId: projectTooling.id,
      title: "Migrate legacy reports to new dashboard",
      assignedToId: dev4.id,
      status: "IN_PROGRESS",
      priority: "HIGH",
      dueDate: daysFromNow(5),
    },
  });
  const t13 = await prisma.task.create({
    data: {
      projectId: projectTooling.id,
      title: "Add CSV export feature",
      assignedToId: dev1.id,
      status: "TODO",
      priority: "LOW",
      dueDate: daysFromNow(8),
    },
  });
  const t14 = await prisma.task.create({
    data: {
      projectId: projectTooling.id,
      title: "Write internal API docs",
      assignedToId: dev2.id,
      status: "TODO",
      priority: "MEDIUM",
      dueDate: daysFromNow(12),
    },
  });
  const t15 = await prisma.task.create({
    data: {
      projectId: projectTooling.id,
      title: "Review access logs for anomalies",
      assignedToId: dev4.id,
      status: "IN_REVIEW",
      priority: "HIGH",
      dueDate: daysFromNow(0),
    },
  });

  // Pre-existing activity log entries, so the feed isn't empty on first load
  await prisma.taskActivityLog.createMany({
    data: [
      {
        taskId: t1.id,
        projectId: projectWebsite.id,
        changedById: dev1.id,
        fromStatus: "IN_REVIEW",
        toStatus: "DONE",
        createdAt: daysFromNow(-4),
      },
      {
        taskId: t2.id,
        projectId: projectWebsite.id,
        changedById: dev1.id,
        fromStatus: "TODO",
        toStatus: "IN_PROGRESS",
        createdAt: daysFromNow(-1),
      },
      {
        taskId: t3.id,
        projectId: projectWebsite.id,
        changedById: dev2.id,
        fromStatus: "IN_PROGRESS",
        toStatus: "IN_REVIEW",
        createdAt: daysFromNow(-0.5),
      },
      {
        taskId: t6.id,
        projectId: projectMobile.id,
        changedById: dev3.id,
        fromStatus: "IN_REVIEW",
        toStatus: "DONE",
        createdAt: daysFromNow(-9),
      },
      {
        taskId: t7.id,
        projectId: projectMobile.id,
        changedById: dev3.id,
        fromStatus: "TODO",
        toStatus: "IN_PROGRESS",
        createdAt: daysFromNow(-2),
      },
      {
        taskId: t10.id,
        projectId: projectMobile.id,
        changedById: dev3.id,
        fromStatus: "IN_PROGRESS",
        toStatus: "IN_REVIEW",
        createdAt: daysFromNow(-0.2),
      },
      {
        taskId: t11.id,
        projectId: projectTooling.id,
        changedById: dev2.id,
        fromStatus: "IN_REVIEW",
        toStatus: "DONE",
        createdAt: daysFromNow(-6),
      },
      {
        taskId: t12.id,
        projectId: projectTooling.id,
        changedById: dev4.id,
        fromStatus: "TODO",
        toStatus: "IN_PROGRESS",
        createdAt: daysFromNow(-3),
      },
      {
        taskId: t15.id,
        projectId: projectTooling.id,
        changedById: dev4.id,
        fromStatus: "IN_PROGRESS",
        toStatus: "IN_REVIEW",
        createdAt: daysFromNow(-0.1),
      },
    ],
  });

  // A couple of pre-existing notifications too, so that badge isn't empty either
  await prisma.notification.createMany({
    data: [
      {
        userId: dev2.id,
        type: "TASK_ASSIGNED",
        message: `You were assigned to "${t3.title}"`,
        relatedTaskId: t3.id,
      },
      {
        userId: pm1.id,
        type: "TASK_IN_REVIEW",
        message: `Task "${t3.title}" was moved to In Review`,
        relatedTaskId: t3.id,
      },
    ],
  });

  console.log("Seed complete. All users share the password: password123");
  console.log({ admin: admin.email, pm1: pm1.email, pm2: pm2.email });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
