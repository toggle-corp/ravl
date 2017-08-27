# Integer
Basic type which denotes a number without decimal parts.
Example: `1`, `2`, `10`, `-12`, `11`, `0`

# Unsigned Integer
Basic type which denotes a positive integer.
Example: `1`, `2`, `10`, `11`, `0`

# Email
Basic type which denotes a valid email.
Example: `johndoe@email.com`, `hariprasad@emailer.com`

## District
User type containing information related  a district.
```javascript
{
    id: 'number',    // required
    name: 'string',    // required
    description: 'string',
    officerAssigned:
    {
        id: 'uint',    // required
        name: 'string',
        wards:
        [
            'string',
        ],    // required
    },
}
```
> A district can be assigned with one more officer if required.

### District Officer
User type containing information related an officer.
```javascript
{
    id: 'uint',    // required
    name: 'string',
    wards:
    [
        'string',
    ],    // required
}
```

