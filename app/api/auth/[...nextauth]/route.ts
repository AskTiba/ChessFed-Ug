// Mock Auth API for UI Simulation
const handler = (req: any, res: any) => {
  return new Response(JSON.stringify({ 
    user: { name: "Anthony Ngisiro", email: "anthony@example.com" } 
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

export { handler as GET, handler as POST };
