const { SignJWT } = require('jose');

async function createTestJWT() {
  const secret = new TextEncoder().encode('LetUSCreateAS3CR3TforTh!s');
  
  const token = await new SignJWT({
    app_user_id: '550e8400-e29b-41d4-a716-446655440002',
    family_id: '550e8400-e29b-41d4-a716-446655440001',
    role_name: 'admin',
    email: 'test@famtodo.dk',
    aud: 'postgrest',
    iss: 'famtodo',
    sub: '550e8400-e29b-41d4-a716-446655440003',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(secret);
  
  console.log('JWT Token:', token);
}

createTestJWT().catch(console.error);