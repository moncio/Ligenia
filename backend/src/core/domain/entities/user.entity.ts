/**
 * Entidad User que representa un usuario del sistema
 */
export class User {
  id: string;
  name: string;
  email: string;
  // Otros campos omitidos para simplificar

  constructor(data: {
    id: string;
    name: string;
    email: string;
    // Otros campos omitidos para simplificar
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    // Otros campos omitidos para simplificar
  }
} 