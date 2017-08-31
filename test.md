# Integer
Basic type which denotes a number without decimal parts.
###### Example
```javascript
7
```

# Unsigned Integer
Basic type which denotes a positive integer.
###### Example
```javascript
1
```

# Email
Basic type which denotes a valid email.
###### Example
```javascript
"ramprasad1212@emailer.com"
```

## District
User type containing information related  a district.
###### Schema
```javascript
{
    id: 'uint',    // required
    index: 'number',
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
###### Example
```javascript
{
  "id": 16,
  "index": 0,
  "name": "ankit",
  "description": "hari",
  "officerAssigned": {
    "id": 5,
    "name": "ram",
    "wards": [
      "city",
      "long text",
      "city",
      "ram"
    ]
  }
}
```
> A district can be assigned with one more officer if required.

### District Officer
User type containing information related an officer.
###### Schema
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
###### Example
```javascript
{
  "id": 13,
  "name": "placeholder",
  "wards": [
    "long text",
    "placeholder",
    "hari",
    "hari",
    "long text",
    "hari",
    "home",
    "shyam"
  ]
}
```


