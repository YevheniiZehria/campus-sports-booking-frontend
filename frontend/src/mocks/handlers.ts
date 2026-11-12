import { http, HttpResponse } from "msw";
import type { Resource, Reservation, User, AvailabilitySlot, MaintenanceBlock } from "@/api/types";

// Date inițiale mock pentru facilități sportive
export let mockResources: Resource[] = [
  {
    id: 1,
    name: "Teren Fotbal Sintetic",
    type: "teren",
    sport: "fotbal",
    description: "Gazon sintetic de ultimă generație, nocturnă completă LED și vestiare dedicate.",
    pricePerHour: 50,
    openHour: "08:00",
    closeHour: "22:00",
  },
  {
    id: 2,
    name: "Teren Tenis de Câmp 1",
    type: "teren",
    sport: "tenis",
    description: "Suprafață de zgură bine întreținută, fileu profesional și nocturnă.",
    pricePerHour: 40,
    openHour: "08:00",
    closeHour: "22:00",
  },
  {
    id: 3,
    name: "Teren Tenis de Câmp 2",
    type: "teren",
    sport: "tenis",
    description: "Teren de zgură exterior, ideal pentru antrenament și meciuri de simplu/dublu.",
    pricePerHour: 40,
    openHour: "08:00",
    closeHour: "22:00",
  },
  {
    id: 4,
    name: "Bazin Olimpic USV",
    type: "bazin",
    sport: "inot",
    description: "Bazin acoperit cu apă încălzită la 28°C, 6 culoare de înot, vestiare și dușuri moderne.",
    pricePerHour: 30,
    openHour: "07:00",
    closeHour: "21:00",
  },
  {
    id: 5,
    name: "Teren Mixt Baschet / Volei",
    type: "teren",
    sport: "baschet",
    description: "Suprafață modulară cauciucată, coșuri reglabile și fileu de volei omologat.",
    pricePerHour: 35,
    openHour: "08:00",
    closeHour: "22:00",
  },
];

// Utilizator mock curent (student USV conectat implicit)
export let mockCurrentUser: User = {
  id: 1,
  email: "yevhenii.zehria@student.usv.ro",
  fullName: "Yevhenii Zehria",
  role: "student",
  isBlocked: false,
  cancellationCount: 0,
  noShowCount: 0,
};

export const mockUsersList: User[] = [
  mockCurrentUser,
  {
    id: 2,
    email: "profesor.sport@usm.ro",
    fullName: "Prof. Mihai Ionescu",
    role: "profesor",
    isBlocked: false,
    cancellationCount: 1,
    noShowCount: 0,
  },
  {
    id: 3,
    email: "admin.baza@usv.ro",
    fullName: "Administrator Bază",
    role: "administrator",
    isBlocked: false,
    cancellationCount: 0,
    noShowCount: 0,
  },
  {
    id: 4,
    email: "student.blocat@student.usv.ro",
    fullName: "Andrei Popa",
    role: "student",
    isBlocked: true,
    cancellationCount: 2,
    noShowCount: 2,
  },
];

// Rezervări mock
export let mockReservations: Reservation[] = [
  {
    id: 101,
    resourceId: 1,
    resourceName: "Teren Fotbal Sintetic",
    userId: 1,
    userName: "Yevhenii Zehria",
    userEmail: "yevhenii.zehria@student.usv.ro",
    start: `${new Date().toISOString().slice(0, 10)}T18:00:00`,
    end: `${new Date().toISOString().slice(0, 10)}T19:00:00`,
    status: "ACTIVA",
    paymentStatus: "NEACHITATA",
    totalPrice: 50,
    createdAt: new Date().toISOString(),
  },
  {
    id: 102,
    resourceId: 2,
    resourceName: "Teren Tenis de Câmp 1",
    userId: 1,
    userName: "Yevhenii Zehria",
    userEmail: "yevhenii.zehria@student.usv.ro",
    start: `${new Date(Date.now() + 86400000).toISOString().slice(0, 10)}T10:00:00`,
    end: `${new Date(Date.now() + 86400000).toISOString().slice(0, 10)}T11:00:00`,
    status: "ACTIVA",
    paymentStatus: "ACHITATA",
    totalPrice: 40,
    createdAt: new Date().toISOString(),
  },
  {
    id: 103,
    resourceId: 4,
    resourceName: "Bazin Olimpic USV",
    userId: 2,
    userName: "Prof. Mihai Ionescu",
    userEmail: "profesor.sport@usm.ro",
    start: `${new Date().toISOString().slice(0, 10)}T12:00:00`,
    end: `${new Date().toISOString().slice(0, 10)}T13:00:00`,
    status: "FINALIZATA",
    paymentStatus: "ACHITATA",
    totalPrice: 30,
    createdAt: new Date().toISOString(),
  },
];

// Blocări de mentenanță mock
export let mockMaintenanceBlocks: MaintenanceBlock[] = [
  {
    id: 1,
    resourceId: 4,
    resourceName: "Bazin Olimpic USV",
    start: `${new Date().toISOString().slice(0, 10)}T07:00:00`,
    end: `${new Date().toISOString().slice(0, 10)}T09:00:00`,
    reason: "Schimbare filtre și recirculare chimică a apei",
  },
];

export const handlers = [
  // 1. GET /api/v1/resources
  http.get("/api/v1/resources", ({ request }) => {
    const url = new URL(request.url);
    const sport = url.searchParams.get("sport");
    const type = url.searchParams.get("type");

    let filtered = [...mockResources];
    if (sport) {
      filtered = filtered.filter((r) => r.sport.toLowerCase() === sport.toLowerCase());
    }
    if (type) {
      filtered = filtered.filter((r) => r.type === type);
    }
    return HttpResponse.json(filtered);
  }),

  // GET /api/v1/resources/:id
  http.get("/api/v1/resources/:resourceId", ({ params }) => {
    const id = Number(params.resourceId);
    const found = mockResources.find((r) => r.id === id);
    if (!found) {
      return HttpResponse.json({ detail: `Resursa ${id} nu există` }, { status: 404 });
    }
    return HttpResponse.json(found);
  }),

  // POST /api/v1/resources (admin)
  http.post("/api/v1/resources", async ({ request }) => {
    const body = (await request.json()) as Partial<Resource>;
    if (mockResources.some((r) => r.name.toLowerCase() === (body.name || "").toLowerCase())) {
      return HttpResponse.json({ detail: "Există deja o resursă cu acest nume" }, { status: 409 });
    }
    const newResource: Resource = {
      id: mockResources.length + 1,
      name: body.name || "Teren nou",
      type: body.type || "teren",
      sport: body.sport || "sport",
      description: body.description || null,
      pricePerHour: body.pricePerHour ?? null,
      openHour: body.openHour || "08:00",
      closeHour: body.closeHour || "22:00",
    };
    mockResources.push(newResource);
    return HttpResponse.json(newResource, { status: 201 });
  }),

  // PATCH /api/v1/resources/:id
  http.patch("/api/v1/resources/:resourceId", async ({ params, request }) => {
    const id = Number(params.resourceId);
    const foundIndex = mockResources.findIndex((r) => r.id === id);
    if (foundIndex === -1) {
      return HttpResponse.json({ detail: `Resursa ${id} nu există` }, { status: 404 });
    }
    const body = (await request.json()) as Partial<Resource>;
    mockResources[foundIndex] = { ...mockResources[foundIndex], ...body };
    return HttpResponse.json(mockResources[foundIndex]);
  }),

  // DELETE /api/v1/resources/:id
  http.delete("/api/v1/resources/:resourceId", ({ params }) => {
    const id = Number(params.resourceId);
    mockResources = mockResources.filter((r) => r.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  // 2. GET /api/v1/resources/:id/availability?date=
  http.get("/api/v1/resources/:resourceId/availability", ({ params, request }) => {
    const resourceId = Number(params.resourceId);
    const url = new URL(request.url);
    const dateStr = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);

    const resource = mockResources.find((r) => r.id === resourceId);
    const startHour = resource?.openHour ? parseInt(resource.openHour.split(":")[0], 10) : 8;
    const endHour = resource?.closeHour ? parseInt(resource.closeHour.split(":")[0], 10) : 22;

    const slots: AvailabilitySlot[] = [];

    // Verificăm rezervările existente pentru această resursă și dată
    const dayReservations = mockReservations.filter((r) => {
      return r.resourceId === resourceId && r.start.startsWith(dateStr) && r.status === "ACTIVA";
    });

    // Verificăm blocările de mentenanță
    const dayMaintenance = mockMaintenanceBlocks.filter((m) => {
      return m.resourceId === resourceId && m.start.startsWith(dateStr);
    });

    for (let h = startHour; h < endHour; h++) {
      let status: "liber" | "ocupat" | "mentenanta" = "liber";

      // Verificăm mentenanță
      const isMaint = dayMaintenance.some((m) => {
        const mStart = new Date(m.start).getHours();
        const mEnd = new Date(m.end).getHours();
        return h >= mStart && h < mEnd;
      });

      if (isMaint) {
        status = "mentenanta";
      } else {
        // Verificăm rezervare
        const isBooked = dayReservations.some((r) => {
          const rStart = new Date(r.start).getHours();
          const rEnd = new Date(r.end).getHours();
          return h >= rStart && h < rEnd;
        });

        if (isBooked) {
          status = "ocupat";
        }
      }

      slots.push({
        startHour: h,
        endHour: h + 1,
        status,
      });
    }

    return HttpResponse.json(slots);
  }),

  // 3. POST /api/v1/auth/login
  http.post("/api/v1/auth/login", async ({ request }) => {
    const body = (await request.json()) as { email: string; password?: string };
    const email = (body.email || "").toLowerCase();

    let userRole: "student" | "profesor" | "administrator" = "student";
    if (email.includes("admin")) {
      userRole = "administrator";
    } else if (email.endsWith("@usm.ro")) {
      userRole = "profesor";
    }

    mockCurrentUser = {
      id: 1,
      email: body.email,
      fullName: email.split("@")[0].replace(".", " ").toUpperCase(),
      role: userRole,
      isBlocked: false,
    };

    return HttpResponse.json({
      accessToken: "mock-jwt-token-campus-sports-booking-usv",
      tokenType: "bearer",
    });
  }),

  // POST /api/v1/auth/register
  http.post("/api/v1/auth/register", async ({ request }) => {
    const body = (await request.json()) as { email: string; fullName: string; phone?: string };
    const email = body.email.toLowerCase();

    let role: "student" | "profesor" | "administrator" = "student";
    if (email.includes("admin")) {
      role = "administrator";
    } else if (email.endsWith("@usm.ro")) {
      role = "profesor";
    }

    mockCurrentUser = {
      id: mockUsersList.length + 1,
      email: body.email,
      fullName: body.fullName,
      role,
      isBlocked: false,
    };
    mockUsersList.push(mockCurrentUser);

    return HttpResponse.json(mockCurrentUser, { status: 201 });
  }),

  // 4. GET /api/v1/users/me
  http.get("/api/v1/users/me", () => {
    return HttpResponse.json(mockCurrentUser);
  }),

  // GET /api/v1/users (admin)
  http.get("/api/v1/users", () => {
    return HttpResponse.json(mockUsersList);
  }),

  // POST /api/v1/users/:id/unblock
  http.post("/api/v1/users/:userId/unblock", ({ params }) => {
    const id = Number(params.userId);
    const user = mockUsersList.find((u) => u.id === id);
    if (user) {
      user.isBlocked = false;
      return HttpResponse.json(user);
    }
    return HttpResponse.json({ detail: "Utilizatorul nu a fost găsit" }, { status: 404 });
  }),

  // 5. GET /api/v1/reservations
  http.get("/api/v1/reservations", () => {
    if (mockCurrentUser.role === "administrator") {
      return HttpResponse.json(mockReservations);
    }
    return HttpResponse.json(mockReservations.filter((r) => r.userId === mockCurrentUser.id));
  }),

  // POST /api/v1/reservations
  http.post("/api/v1/reservations", async ({ request }) => {
    const body = (await request.json()) as { resourceId: number; start: string; end: string };

    // Verificare 1: cont blocat
    if (mockCurrentUser.isBlocked) {
      return HttpResponse.json(
        { detail: "Contul tău este blocat din cauza neprezentărilor." },
        { status: 403 }
      );
    }

    // Verificare 2: limita lunară de 3 rezervări pentru studenți
    if (mockCurrentUser.role === "student") {
      const currentMonthKey = body.start.slice(0, 7);
      const studentMonthlyCount = mockReservations.filter(
        (r) => r.userId === mockCurrentUser.id && r.status === "ACTIVA" && r.start.startsWith(currentMonthKey)
      ).length;

      if (studentMonthlyCount >= 3) {
        return HttpResponse.json(
          { detail: "Ai atins limita maximă de 3 rezervări permise studenților în această lună." },
          { status: 403 }
        );
      }
    }

    // Verificare 3: conflict de orar (409)
    const conflict = mockReservations.some(
      (r) =>
        r.resourceId === body.resourceId &&
        r.status === "ACTIVA" &&
        r.start === body.start
    );

    if (conflict) {
      return HttpResponse.json(
        { detail: "Intervalul ales a fost deja rezervat de alt utilizator." },
        { status: 409 }
      );
    }

    const resursa = mockResources.find((r) => r.id === body.resourceId);
    const newReservation: Reservation = {
      id: 200 + mockReservations.length + 1,
      resourceId: body.resourceId,
      resourceName: resursa?.name || `Teren #${body.resourceId}`,
      userId: mockCurrentUser.id,
      userName: mockCurrentUser.fullName,
      userEmail: mockCurrentUser.email,
      start: body.start,
      end: body.end,
      status: "ACTIVA",
      paymentStatus: "NEACHITATA",
      totalPrice: resursa?.pricePerHour || 40,
      createdAt: new Date().toISOString(),
    };

    mockReservations.unshift(newReservation);
    return HttpResponse.json(newReservation, { status: 201 });
  }),

  // DELETE /api/v1/reservations/:id (anulare)
  http.delete("/api/v1/reservations/:reservationId", ({ params }) => {
    const id = Number(params.reservationId);
    const reservation = mockReservations.find((r) => r.id === id);

    if (!reservation) {
      return HttpResponse.json({ detail: "Rezervarea nu a fost găsită" }, { status: 404 });
    }

    // Verificare regulă 2 ore (dacă nu e admin)
    if (mockCurrentUser.role !== "administrator") {
      const now = new Date();
      const startTime = new Date(reservation.start);
      const diffHours = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffHours < 2) {
        return HttpResponse.json(
          { detail: "Anularea rezervării nu mai este posibilă cu mai puțin de 2 ore înainte." },
          { status: 400 }
        );
      }
    }

    reservation.status = "ANULATA";
    return HttpResponse.json(reservation);
  }),

  // PATCH /api/v1/reservations/:id/payment (admin)
  http.patch("/api/v1/reservations/:reservationId/payment", async ({ params, request }) => {
    const id = Number(params.reservationId);
    const body = (await request.json()) as { paymentStatus: "ACHITATA" | "NEACHITATA" };
    const reservation = mockReservations.find((r) => r.id === id);

    if (!reservation) {
      return HttpResponse.json({ detail: "Rezervarea nu există" }, { status: 404 });
    }

    reservation.paymentStatus = body.paymentStatus;
    return HttpResponse.json(reservation);
  }),

  // 6. GET /api/v1/maintenance-blocks
  http.get("/api/v1/maintenance-blocks", () => {
    return HttpResponse.json(mockMaintenanceBlocks);
  }),

  // POST /api/v1/maintenance-blocks
  http.post("/api/v1/maintenance-blocks", async ({ request }) => {
    const body = (await request.json()) as { resourceId: number; start: string; end: string; reason?: string };
    const resursa = mockResources.find((r) => r.id === body.resourceId);
    const newBlock: MaintenanceBlock = {
      id: mockMaintenanceBlocks.length + 1,
      resourceId: body.resourceId,
      resourceName: resursa?.name || `Teren #${body.resourceId}`,
      start: body.start,
      end: body.end,
      reason: body.reason || null,
    };
    mockMaintenanceBlocks.push(newBlock);
    return HttpResponse.json(newBlock, { status: 201 });
  }),

  // DELETE /api/v1/maintenance-blocks/:id
  http.delete("/api/v1/maintenance-blocks/:blockId", ({ params }) => {
    const id = Number(params.blockId);
    mockMaintenanceBlocks = mockMaintenanceBlocks.filter((b) => b.id !== id);
    return new HttpResponse(null, { status: 204 });
  }),

  // 7. GET /api/v1/reports/financial
  http.get("/api/v1/reports/financial", ({ request }) => {
    const url = new URL(request.url);
    const formatParam = url.searchParams.get("format") || "json";

    if (formatParam === "csv") {
      const csv = "ID,Teren,Data,Suma,Status Plata\n101,Teren Fotbal Sintetic,2026-11-12,50,NEACHITATA\n102,Teren Tenis de Camp 1,2026-11-13,40,ACHITATA";
      return new HttpResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="raport_financiar.csv"',
        },
      });
    }

    return HttpResponse.json({
      month: "2026-11",
      totalRevenue: 4350,
      paidCount: 89,
      unpaidCount: 14,
      breakdownBySport: [
        { sport: "fotbal", revenue: 2100, count: 42 },
        { sport: "tenis", revenue: 1200, count: 30 },
        { sport: "inot", revenue: 750, count: 25 },
        { sport: "baschet", revenue: 300, count: 6 },
      ],
    });
  }),

  // GET /api/v1/reports/occupancy
  http.get("/api/v1/reports/occupancy", () => {
    return HttpResponse.json({
      month: "2026-11",
      overallRate: 74.2,
      slotsBySport: [
        { sport: "fotbal", totalSlots: 140, bookedSlots: 112, rate: 80.0 },
        { sport: "tenis", totalSlots: 280, bookedSlots: 196, rate: 70.0 },
        { sport: "inot", totalSlots: 140, bookedSlots: 105, rate: 75.0 },
        { sport: "baschet", totalSlots: 140, bookedSlots: 91, rate: 65.0 },
      ],
    });
  }),
];

