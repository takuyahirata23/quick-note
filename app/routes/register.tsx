import { useActionData } from 'remix'
import { isEmpty } from 'ramda'

import { countUserByEmail, createUser } from '~/db/users/operations.server'
import { hashPassword } from '~/utils/bcrypt.server'
import { startUserSession } from '~/utils/session.server'
import { validateRegisterForm } from '~/utils/validations'
import { getFields, areAllString } from '~/utils/functions'
import { ErrorLayout, Fieldset, Input, Button } from '~/components'

import type { ActionFunction } from 'remix'
import { ActionData } from '~/types'

export const action: ActionFunction = async ({
  request
}): Promise<Response | ActionData> => {
  const formData = await request.formData()

  const fields = getFields(
    ['name', 'email', 'password', 'passwordConfirmation'],
    formData
  )

  if (!areAllString(fields))
    return {
      formError: 'Form was not submitted correctly'
    }

  const fieldErrors = validateRegisterForm(fields)

  if (!isEmpty(fieldErrors))
    return {
      fieldErrors,
      fields
    }

  const { name, email, password } = fields

  const { count } = await countUserByEmail(email)

  if (Number(count)) return { formError: 'User already exists' }

  const passwordHash = hashPassword(password)

  const user = await createUser({ name, email, passwordHash } as Record<
    'name' | 'email' | 'passwordHash',
    string
  >)

  return startUserSession(user.id)
}

export default function Register() {
  const { fields, fieldErrors, formError } = useActionData() || {}

  return (
    <form method="post">
      <Fieldset legend="Register">
        <div className="flex flex-col gap-y-6">
          <Input
            label="Name"
            name="name"
            id="name"
            defaultValue={fields?.name}
            errorMessage={fieldErrors?.name}
            placeholder="Your Name"
          />
          <Input
            label="Email"
            defaultValue={fields?.email}
            errorMessage={fieldErrors?.email}
            type="email"
            name="email"
            id="email"
            placeholder="your@email.com"
          />
          <Input
            label="Password"
            defaultValue={fields?.password}
            errorMessage={fieldErrors?.password}
            type="password"
            name="password"
            id="password"
            placeholder="Your password"
          />
          <Input
            label="Password Confirmation"
            defaultValue={fields?.passwordConfirmation}
            errorMessage={fieldErrors?.passwordConfirmation}
            type="password"
            name="passwordConfirmation"
            id="passwordConfirmation"
            placeholder="Same password above"
          />
          <div className="w-2/3 self-center">
            <Button type="submit">Register</Button>
          </div>
          {formError && <p className="text-center">{formError}</p>}
        </div>
      </Fieldset>
    </form>
  )
}

export function ErrorBoundary() {
  return <ErrorLayout />
}
